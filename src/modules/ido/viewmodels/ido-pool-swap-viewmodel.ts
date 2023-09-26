import { loadingController } from '@/components/global-loading/global-loading-controller'
import { snackController } from '@/components/snack-bar/snack-bar-controller'
import { TIERS, Zero } from '@/constants'
import { bigNumberHelper } from '@/helpers/bignumber-helper'
import { promiseHelper } from '@/helpers/promise-helper'
import ERC20TokenContract from '@/libs/models/ERC20TokenContract'
import { walletStore } from '@/stores/wallet-store'
import { FixedNumber } from '@ethersproject/bignumber'
import _ from 'lodash'
import { computed, IReactionDisposer, observable, runInAction } from 'mobx'
import { asyncAction } from 'mobx-utils'
import { Subject, Subscription, timer } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { PoolStore } from '../stores/pool-store'
import { poolsStore } from '../stores/pools-store'
import { rankHandler } from '@/helpers/rank-handler'

export class IdoPoolSwapViewModel {
  @observable remainToken = Zero

  @observable lpLockedBalance = FixedNumber.from('0')
  @observable requiredTokenBalance = FixedNumber.from('0')
  @observable purchasedToken = FixedNumber.from('0')
  @observable maximumToken = Zero
  @observable tradeValue = FixedNumber.from(1)
  @observable tradeTokenBalance = FixedNumber.from(0)

  @observable poolStore?: PoolStore

  @observable approved = false
  @observable swaping = false
  @observable approving = false

  @observable forceError = ''

  @observable userRank = '0'
  @observable amountConfigs: any[] = []
  @observable userMaxAllocation = Zero
  @observable tax = '0'

  private _diposers: IReactionDisposer[] = []
  private _unsubcrible = new Subject()
  private _lastBalanceTimer?: Subscription
  private _tradeTokenContract?: ERC20TokenContract;

  @asyncAction *connectWallet() {
    yield walletStore.connect()
    this.getContractContrains()
  }

  cancelInterval() {
    this._lastBalanceTimer?.unsubscribe()
  }

  @asyncAction *loadPool(slugName: string, index = 3) {
    loadingController.increaseRequest()
    try {
      this.poolStore = poolsStore.allPools.find(x => x.pool.slugName === slugName)
      const contract = this.poolStore!.contract
      if (contract) {
        ;[this.tradeValue, this.userRank, this.amountConfigs, this.tax] = yield Promise.all([
          contract.tradeValue().then(val => FixedNumber.from(val)),
          rankHandler.getUserRank(),
          contract.getAmountConfigs(),
          contract.getTax()
        ])

        const currentUserConfig = this.amountConfigs.find(c => c.rank === this.userRank)
        if (this.amountConfigs.length && this.amountConfigs.length === 1) {
          const noTier = this.amountConfigs[0].rank === '0'
          if (noTier) {
            this.userMaxAllocation = FixedNumber.from(this.amountConfigs[0].amount)
          }
        }
        if (currentUserConfig) this.userMaxAllocation = FixedNumber.from(currentUserConfig.amount)

        if (this.tradeByErc20) {
          const tokenAddress = yield contract!.tradeErc20()
          this._tradeTokenContract = walletStore.app.getERC20TokenContract({
            tokenAddress,
            decimals: 18
          })
          yield this._tradeTokenContract.initAsync()
        }
        yield this.getContractContrains()
        this._lastBalanceTimer?.unsubscribe()
        this._lastBalanceTimer = timer(0, 5000)
          .pipe(takeUntil(this._unsubcrible))
          .subscribe(async index => {
            if (this.poolStore?.tradeByErc20) {
              const contract = this?._tradeTokenContract
              if (contract && walletStore.account) {
                contract.getTokenAmount(walletStore.account).then(x => {
                  runInAction(() => (this.tradeTokenBalance = FixedNumber.from(`${x}`)))
                })
              }
            } else {
              runInAction(() => (this.tradeTokenBalance = walletStore.bnbBalance))
            }
            if (index > 0 && index % 3 === 0) {
              this.getContractContrains()
            }
          })
      }
    } catch (err) {
      console.error(err)
      if (index > 0) {
        yield promiseHelper.delay(1000)
        this.loadPool(slugName, --index)
      } else snackController.error('There is unexpected error, please RELOAD')
    } finally {
      loadingController.decreaseRequest()
    }
  }

  @observable loadingContrains = false;

  @asyncAction *getContractContrains() {
    this.loadingContrains = true
    try {
      const contract = this.poolStore!.contract
      if (contract) {
        if (this.tradeByErc20 && !this.approved) {
          this.approved = yield this._tradeTokenContract?.isApproved({
            address: walletStore.account,
            spenderAddress: this.poolStore!.pool.address
          })
        }
        if (this.connected) {
          this.purchasedToken = yield contract.getBoughtAmount(walletStore.account)
        }

        let allocated: FixedNumber
        let forSales: FixedNumber
        ;[this.maximumToken, allocated, forSales] = yield Promise.all([
          contract.individualMaximumAmount().then(val => FixedNumber.from(val)),
          contract.tokensAllocated().then(val => FixedNumber.from(val)),
          contract.tokensForSale().then(val => FixedNumber.from(val))
        ])

        this.remainToken = forSales.subUnsafe(allocated)
        yield promiseHelper.delay(1000)
      }
    } finally {
      this.loadingContrains = false
    }
  }

  @asyncAction *approve() {
    try {
      this.approving = true
      const contract = this.poolStore!.contract!
      const tokenContract = this._tradeTokenContract!
      const finished = yield contract.isFinalized()
      if (finished) throw new Error('This pool is finalized')
      yield tokenContract.approve({ address: this.poolStore!.pool.address })
      this.approved = yield tokenContract.isApproved({
        address: walletStore.account,
        spenderAddress: this.poolStore!.pool.address
      })
    } finally {
      this.approving = false
    }
  }

  @asyncAction *swap(tokenAmountText: string) {
    try {
      this.swaping = true
      const contract = this.poolStore!.contract!
      const finished = yield contract.isFinalized()
      if (finished) throw new Error('This pool is ended')
      if (this.maximumToken.isZero()) {
        yield this.getContractContrains()
      }
      // const open = yield contract.isOpen()
      // if (!open) throw new Error('This pool has to be open')
      const tokenAmount = FixedNumber.from(tokenAmountText || '0')
      if (tokenAmount.isZero() || tokenAmount.isNegative()) throw new Error(`Token amount is not valid`)
      if (bigNumberHelper.gt(tokenAmount, this.maxRemainPurchaseTokens))
        throw new Error(`Token amount must not exceed ${this.maxRemainPurchaseTokens}`)
      const hasWhitelist = yield contract.hasWhitelisting()
      if (hasWhitelist) {
        const white = yield contract.isWhitelisted({ address: walletStore.account })
        if (!white) throw new Error('You are not in whitelist')
      }
      const res = yield contract.swap({
        tokenAmount: tokenAmount.toString()
      })
      if (res?.status) {
        snackController.success('Swap successful')
        this.getContractContrains()
      }
    } finally {
      this.swaping = false
    }
  }

  async calculateBnbCost(tokenAmount = 0) {
    try {
      const contract = this.poolStore?.contract
      if (!contract) return Zero
      if (isNaN(tokenAmount)) return Zero
      return FixedNumber.from(tokenAmount.toString()).mulUnsafe(this.tradeValue)
    } catch (error) {
      return Zero
    }
  }

  calculateAmountToken(bnbCost = 0) {
    try {
      if (isNaN(bnbCost)) return Zero
      return FixedNumber.from(bnbCost).divUnsafe(this.tradeValue)
    } catch (error) {
      return Zero
    }
  }

  @computed get purchasedBnb() {
    return this.purchasedToken.mulUnsafe(this.tradeValue)
  }

  @computed get maxRemainPurchaseBnb() {
    return this.maxRemainPurchaseTokens.mulUnsafe(this.tradeValue)
  }

  @computed get maxRemainPurchaseTokens() {
    const possibleMax = this.maximumToken.subUnsafe(this.purchasedToken)
    let result: FixedNumber
    if (possibleMax.isNegative()) {
      result = FixedNumber.from('0')
    } else {
      const maxTokenCanBuy = this.tradeTokenBalance.divUnsafe(this.tradeValue)
      if (bigNumberHelper.gt(possibleMax, this.remainToken)) {
        if (bigNumberHelper.gt(this.remainToken, maxTokenCanBuy)) {
          result = maxTokenCanBuy
        } else {
          result = this.remainToken
        }
      } else if (bigNumberHelper.gt(possibleMax, maxTokenCanBuy)) {
        result = maxTokenCanBuy
      } else {
        result = possibleMax
      }
    }
    return result
  }

  @computed get poolRemainedBnb() {
    return this.remainToken.mulUnsafe(this.tradeValue)
  }

  @computed get connected() {
    return walletStore.connected
  }

  @computed get poolId() {
    return this.poolStore?.pool?.id
  }
  @computed get tradeToken() {
    return this.poolStore?.tradeToken
  }
  @computed get tradeByErc20() {
    return !!this.poolStore?.tradeByErc20
  }
  @computed get tokenName() {
    return this.poolStore?.pool.tokenName
  }
  @computed get isShowTax() {
    return +this.tax > 0
  }
  @computed get enableSwap() {
    return !this.tradeByErc20 || this.approved
  }
  @computed get requiredBsl() {
    return this.poolStore?.requiredBsl
  }
  @computed get possibleMaxTradeToken() {
    return this.maximumToken.mulUnsafe(this.tradeValue)
  }
  @computed get logoUrl() {
    return this.poolStore?.pool?.logoUrl
  }
  @computed get ratioFn() {
    return this.poolStore?.ratioFn
  }
  @computed get userTier() {
    const tier = TIERS.find(t => t.index === +this.userRank)
    if (!tier) {
      return {
        index: 7,
        type: 'other',
        name: 'Other'
      }
    }
    return tier
  }
  destroy() {
    this._diposers.forEach(d => d())
    this._unsubcrible.next()
    this._unsubcrible.complete()
  }
}
