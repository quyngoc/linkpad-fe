import { snackController } from '@/components/snack-bar/snack-bar-controller'
import { getBscScanLink } from '@/helpers'
import { mappingWalletHandler } from '@/helpers/mapping-wallet-handler'
import ERC20TokenContract from '@/libs/models/ERC20TokenContract'
import FixedSwapContract, { FixedSwapContractPurchase } from '@/libs/models/FixedSwapContract'
import { walletStore } from '@/stores/wallet-store'
import { FixedNumber } from '@ethersproject/bignumber'
import { get } from 'lodash-es'
import { computed, IReactionDisposer, observable, reaction } from 'mobx'
import { asyncAction } from 'mobx-utils'
import moment from 'moment'
import { formatDuration } from '../business/swap-contract.business'
import { PoolStore } from '../stores/pool-store'
import { poolsStore } from '../stores/pools-store'
import { adminWallets, Zero } from '@/constants'
import { bigNumberHelper } from '@/helpers/bignumber-helper'
import { loadingController } from '@/components/global-loading/global-loading-controller'
import Web3 from 'web3'
import { VestingHandler } from '@/helpers/vesting-handler'

export class PurchasedItemViewModel {
  @observable loading = false

  constructor(
    public purchase: FixedSwapContractPurchase,
    private contract: FixedSwapContract | VestingHandler,
    private vm: IdoPoolDetailViewModel
  ) {
    //
  }

  @asyncAction *claimToken() {
    this.loading = true
    if (this.vm.poolStore?.type === 'v5') this.vm.claiming = true
    try {
      if (this.canRedeemTokens) {
        yield this.contract?.redeemTokens({ purchase_id: this.purchase._id })
        snackController.success('Claim successful')
        this.vm.loadPurchaseds(true)
      }
    } catch (error) {
      snackController.commonError(error)
    } finally {
      this.loading = false
      if (this.vm.poolStore?.type === 'v5') this.vm.claiming = false
    }
  }

  @computed get canRedeemTokens() {
    let ok = this.vm.poolStore?.canRedeemTokens && !!this.purchase.validAfterDate
    ok = ok && moment().isAfter(moment(this.purchase.validAfterDate))
    return ok
  }

  @computed get isTBARedeem() {
    return this.vm.poolStore?.isTBARedeem
  }
}

export class IdoPoolDetailViewModel {
  @observable poolid = ''
  @observable poolStore?: PoolStore
  @observable purchases: PurchasedItemViewModel[] = []
  @observable approved = true
  @observable approving = false
  @observable solanaAddress = ''
  @observable claiming = false
  @observable refunding = false
  @observable purchasedToken = Zero

  private _tradeTokenContract?: ERC20TokenContract

  _disposers: IReactionDisposer[] = [];

  @asyncAction *connectWallet() {
    yield walletStore.connect()
  }

  constructor() {
    this._disposers = [
      reaction(
        () => walletStore.account,
        () => {
          this.loadPool(this.pool?.slugName!)
          // mappingWalletHandler.injectMetamask(walletStore.web3!)
        }
      )
    ]
  }

  @asyncAction *loadPool(slugName: string) {
    this.poolStore = yield poolsStore.getPool(slugName)
    const contract = this.poolStore?.contract
    if (
      contract &&
      this.poolStore?.tradeByErc20 &&
      walletStore.connected &&
      walletStore.chainId === this.poolStore.chainId &&
      !this.vestingAddress
    ) {
      try {
        this._tradeTokenContract = walletStore.app.getERC20TokenContract({
          tokenAddress: yield contract.tradeErc20(),
          decimals: 18
        })
        yield this._tradeTokenContract.initAsync()
      } catch (error) {
        snackController.commonError(error)
        console.error(error)
      }
    }
    this.poolStore?.loadData()
    this.loadPurchaseds(true)
    this.checkApproved()

    // if (walletStore.account && walletStore.chainIdValid) {
    //   this.solanaAddress = yield mappingWalletHandler.getSolanaAddress(walletStore.account)
    // }
  }

  @asyncAction *checkApproved() {
    if (walletStore.account && this._tradeTokenContract) {
      this.approved = yield this._tradeTokenContract.isApproved({
        address: walletStore.account,
        spenderAddress: this.poolStore!.pool.address
      })
    }
  }

  @asyncAction *loadPurchaseds(forceUpdate = false) {
    let purchases: FixedSwapContractPurchase[] = []
    let contract: FixedSwapContract | VestingHandler | undefined
    if (this.vestingAddress) {
      const vestingContract = this.poolStore?.vestingContract

      contract = vestingContract
      if (vestingContract && walletStore.account && walletStore.chainId === this.poolStore?.vestingChainId) {
        if (forceUpdate) {
          yield vestingContract.getUserInfo()
          yield vestingContract.getSchedules()
        }
        purchases = vestingContract.schedules
      }
    } else {
      contract = this.poolStore?.contract
      if (contract && walletStore.account) {
        const purchaseIds: string[] = yield contract.getAddressPurchaseIds({ address: walletStore.account })
        purchases = yield Promise.all(
          purchaseIds.map(purchase_id => this.poolStore?.contract?.getPurchase({ purchase_id }))
        )

        const pendingPurchase: FixedSwapContractPurchase = yield contract.getPendingPurchase()
        if (!FixedNumber.from(pendingPurchase.amount).isZero()) {
          purchases.push(pendingPurchase)
        }
      }
    }

    this.purchases = purchases
      .filter(p => this.pool?.tokenName !== 'SON' || (p._id as any) !== -1)
      .map((p, index) => {
        if (this.tokenName === 'SFEX') {
          p.validAfterDate = moment(p.validAfterDate)
            .add(4, 'hour')
            .add(10, 'minutes')
            .toDate()
          if (index === 0) p.wasFinalized = true
        }
        return new PurchasedItemViewModel(p, contract!, this)
      })
  }

  @asyncAction *approve() {
    try {
      this.approving = true
      const tokenContract = this._tradeTokenContract!
      const finished = false //yield contract.isFinalized()
      if (finished) {
        snackController.error('This pool is finalized')
      } else {
        yield tokenContract.approve({ address: this.poolStore!.pool.address })
        this.approved = yield tokenContract.isApproved({
          address: walletStore.account,
          spenderAddress: this.poolStore!.pool.address
        })
        snackController.success('Approve successful')
      }
    } catch (err) {
      snackController.commonError(err)
    } finally {
      this.approving = false
    }
  }

  @asyncAction *getBoughtAmount() {
    try {
      this.refunding = true
      if (this.vestingAddress) {
        this.purchasedToken = this.poolStore?.vestingContract?.userInfo.amount!
      } else {
        this.purchasedToken = yield this.poolStore?.contract?.getBoughtAmount(walletStore.account)
      }
    } catch (error) {
      snackController.commonError(error)
    } finally {
      this.refunding = false
    }
  }

  @asyncAction *refund() {
    let contract: FixedSwapContract | VestingHandler | undefined
    if (this.vestingAddress) contract = this.poolStore?.vestingContract
    else contract = this.poolStore?.contract

    this.refunding = true
    try {
      yield contract?.refund()
      yield this.loadPurchaseds(true)
      let msg = 'Refund successful'
      if (this.vestingAddress && !this.allowRefundUsd) msg = 'Register refund successful'
      snackController.success(msg)
    } catch (error) {
      snackController.commonError(error)
    } finally {
      this.refunding = false
    }
  }

  destroy() {
    this._disposers.forEach(d => d())
  }

  async exportBuyers() {
    loadingController.increaseRequest()
    try {
      const contract = this.poolStore?.contract
      const buyers = await contract?.getBuyers()
      const tasks = buyers!.map(async address => {
        const boughtAmount = await contract?.getBoughtAmount(address)
        const tokenAmount = FixedNumber.from(boughtAmount?.toString())
        const totalBusd = tokenAmount.mulUnsafe(this.ratioFn!)
        return {
          walletAddress: address,
          tokenAmount: tokenAmount.toString(),
          totalBusd: totalBusd.toString()
        }
      })
      const results = await Promise.all(tasks)

      let data = '\ufeff' + 'ADDRESS,TOKEN,USD\n'
      results.forEach(el => {
        const line = el?.walletAddress + ',' + el.tokenAmount + ',' + el.totalBusd + '\n'
        data += line
      })
      const blob = new Blob([data], { type: 'csv/plain' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `${this.poolName} - buyers.csv`
      link.click()
    } catch (error) {
      snackController.commonError(error)
    } finally {
      loadingController.decreaseRequest()
    }
  }

  @computed get addressBscUrl() {
    if (!this.contractAddress) return ''
    return getBscScanLink(this.chainId || 56, this.contractAddress, 'address')
  }

  @computed get viewScanText() {
    const chainId = this.chainId || 56
    switch (chainId) {
      case 1:
      case 3:
        return 'View etherscan'
      case 56:
      case 97:
      default:
        return 'View bscscan'
    }
  }

  @computed get pool() {
    return this.poolStore?.pool
  }
  @computed get poolId() {
    return this.poolStore?.pool.id
  }
  @computed get minAllocation() {
    return this.pool?.minAllocation ?? 'TBA'
  }
  @computed get maxAllocation() {
    return this.pool?.maxAllocation ?? 'TBA'
  }
  @computed get accessType() {
    return this.pool?.accessType
  }
  @computed get totalSupply() {
    return this.pool?.totalSupply
  }
  @computed get tokenDistribution() {
    return this.pool?.startDate
  }
  @computed get publishedText() {
    const poolState = this.poolStore?.poolState
    if (!poolState) return ''
    const { started, startDuration } = poolState
    return started ? `Published ${formatDuration(startDuration)} ago` : ''
  }
  @computed get closesText() {
    const poolState = this.poolStore?.poolState
    if (!poolState) return ''
    const { ended, endDuration } = poolState
    return ended ? 'Ended' : `${formatDuration(endDuration)}`
  }
  @computed get poolName() {
    return this.pool?.name || ''
  }
  @computed get tokenName() {
    return this.pool?.tokenName || ''
  }
  @computed get tokenAddress() {
    return this.pool?.tokenAddress || 'TBA'
  }
  @computed get contractAddress() {
    return this.pool?.address || ''
  }
  @computed get token2TradeToken() {
    return this.poolStore?.token2TradeToken
  }
  @computed get poolState() {
    return this.poolStore?.poolState
  }
  @computed get purchasedTokens() {
    return this.poolStore?.purchasedTokens
  }
  @computed get totaltokens() {
    return this.poolStore?.totaltokens
  }
  @computed get isShowTotalTokens() {
    try {
      return bigNumberHelper.gt(this.totaltokens!, Zero)
    } catch (error) {
      return false
    }
  }
  @computed get progress() {
    return this.poolStore?.progress
  }
  @computed get participants() {
    return this.poolStore?.participants
  }
  @computed get hideParticipants() {
    return this.poolStore?.hideParticipants
  }
  @computed get description() {
    return this.poolStore?.pool?.description || this.poolStore?.pool?.data?.shortDescription
  }
  @computed get tradeToken() {
    return this.poolStore?.tradeToken
  }
  @computed get allowSwap() {
    const ended = this.poolState?.ended
    const started = this.poolState?.started
    const isWhitelisted = this.poolStore?.isWhitelisted
    const hasWhitelist = this.poolStore?.hasWhitelist
    return started && !ended && (!hasWhitelist || isWhitelisted)
  }
  @computed get isNotInWhitelisted() {
    const isWhitelisted = this.poolStore?.isWhitelisted
    const hasWhitelist = this.poolStore?.hasWhitelist
    return this.contractAddress && hasWhitelist && !isWhitelisted
  }
  @computed get isBslHolderType() {
    return this.poolStore?.requiredBsl
  }
  @computed get claimAirdrop() {
    return this.pool?.data?.claimType === 'airdrop'
  }
  @computed get logoUrl() {
    return this.pool?.logoUrl || this.pool?.file
  }
  @computed get medium() {
    return this.pool?.data?.medium
  }
  @computed get web() {
    return this.pool?.data?.web
  }
  @computed get twitter() {
    return this.pool?.data?.twitter
  }
  @computed get telegram() {
    return this.pool?.data?.telegram
  }
  @computed get telegramChat() {
    return this.pool?.data?.telegramChat
  }
  @computed get discord() {
    return this.pool?.data?.discord
  }
  @computed get chainId() {
    if (this.vestingAddress) return this.pool?.vestingChainId
    return this.pool?.chainId
  }
  @computed get allowApproveContract() {
    const usingTradeErc = this.poolStore?.tradeByErc20
    return usingTradeErc && !this.approved && !this.isNotInWhitelisted && !this.poolState?.ended
  }
  @computed get solanaRequired() {
    return this.pool?.data?.solanaRequired
  }
  @computed get isShowRefundButton() {
    if (this.poolStore?.showRefund) {
      const firstPurchase = this.purchases && this.purchases[0]
      if (get(firstPurchase, 'purchase.validAfterDate')) {
        const purchase = firstPurchase.purchase
        const result = !purchase.refunded && +purchase.amount && !purchase.wasFinalized
        return result
      }
    }

    return false
  }
  @computed get canRefund() {
    const firstPurchase = this.purchases && this.purchases[0]
    if (get(firstPurchase, 'purchase.validAfterDate')) {
      const purchase = firstPurchase.purchase
      const claimStarted = moment().isAfter(moment(purchase.validAfterDate))
      const refundValidTime = moment().isBetween(moment(purchase.refundStart), moment(purchase.refundEnd))

      return refundValidTime && !this.claiming && claimStarted
    }
    return false
  }

  @computed get refundEndTime() {
    const firstPurchase = this.purchases && this.purchases[0]
    if (get(firstPurchase, 'purchase.validAfterDate')) {
      const purchase = firstPurchase.purchase
      return purchase.refundEnd
    }
  }
  @computed get showRefundCountdown() {
    if (this.poolStore?.showRefund) {
      const firstPurchase = this.purchases && this.purchases[0]
      if (get(firstPurchase, 'purchase.validAfterDate')) {
        const purchase = firstPurchase.purchase
        const claimStarted = moment().isAfter(moment(purchase.validAfterDate))
        const refundValidTime = moment().isBetween(moment(purchase.refundStart), moment(purchase.refundEnd))

        return !this.forceRefund && refundValidTime && claimStarted && !purchase.refunded && !purchase.wasFinalized
      }
    }
    return false
  }

  @computed get hideContractAddress() {
    return this.poolStore?.hideContractAddress
  }
  @computed get forceRefund() {
    return this.pool?.data?.forceRefund
  }

  @computed get startDate() {
    const time = moment(this.pool?.startDate).unix()
    return time
  }
  @computed get endDate() {
    const time = moment(this.pool?.endDate).unix()
    return time
  }

  @computed get connected() {
    return walletStore.connected
  }

  @computed get onSale() {
    return this.poolState?.started && !this.poolState.ended
  }
  @computed get showStartCountDown() {
    return !this.poolState?.isTBAStartDate && !this.poolState?.started
  }

  @computed get purchasedBnb() {
    try {
      return this.purchasedToken.mulUnsafe(FixedNumber.from(`${this.ratio}`))
    } catch (error) {
      return Zero
    }
  }

  @computed get isAdmin() {
    if (walletStore.account && Web3.utils.isAddress(walletStore.account)) {
      for (const wallet of adminWallets) {
        const w = Web3.utils.toChecksumAddress(wallet)
        const userAddress = Web3.utils.toChecksumAddress(walletStore.account)
        if (w === userAddress) {
          return true
        }
      }
    }

    return false
  }

  @computed get ratio() {
    return this.pool?.ratio ? +this.pool?.ratio?.toFixed(10) : 1
  }

  @computed get ratioFn() {
    return this.poolStore?.ratioFn
  }

  @computed get vestingAddress() {
    return this.poolStore?.vestingAddress
  }
  @computed get vestingNetwork() {
    return this.poolStore?.vestingNetwork
  }
  @computed get vestingChainId() {
    return this.poolStore?.vestingChainId
  }
  @computed get allowRefundUsd() {
    return !!this.poolStore?.allowRefundUsd
  }
}
