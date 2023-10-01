import { FixedPoolModel } from '@/models/fixed-pool-model'
import { action, computed, IReactionDisposer, observable, reaction } from 'mobx'
import { asyncAction } from 'mobx-utils'
import { FixedNumber } from '@ethersproject/bignumber'
import { getContract, getPoolState, PoolState } from '../business/swap-contract.business'
import FixedSwapContract from '@/libs/models/FixedSwapContract'
import { walletStore } from '@/stores/wallet-store'
import { formatDuration } from '../business/swap-contract.business'
import { interval, Subject } from 'rxjs'
import { takeUntil, takeWhile } from 'rxjs/operators'
import { bigNumberHelper } from '@/helpers/bignumber-helper'
import { max } from 'lodash-es'
import { VestingHandler } from '@/helpers/vesting-handler'
import { snackController } from '@/components/snack-bar/snack-bar-controller'

export class PoolStore {
  @observable participants = 0
  @observable maxPurchaseBnb = FixedNumber.from(0)
  @observable purchasedTokens = FixedNumber.from(0)
  @observable totaltokens = FixedNumber.from(0)
  @observable poolState?: PoolState
  @observable pool: FixedPoolModel
  @observable isAtomicSwap = false
  @observable isFinalized = false
  @observable hasWhitelist = true
  @observable isWhitelisted = false

  contract?: FixedSwapContract
  vestingContract?: VestingHandler
  private loaded = false

  private _diposers: IReactionDisposer[] = []
  private _unsubcrible = new Subject()

  constructor(pool: FixedPoolModel) {
    this.pool = pool
    const { participants, tokensAllocated } = this.pool.data || {}
    if (participants) this.participants = participants
    if (tokensAllocated) this.purchasedTokens = FixedNumber.from(tokensAllocated)
    this.totaltokens = FixedNumber.from(pool.totalRaise || '0')
    this.maxPurchaseBnb = FixedNumber.from(pool.maxAllocation || '0').mulUnsafe(FixedNumber.from(this.ratio))
    try {
      this.contract = getContract(pool) as any
      this.contract?.assertERC20Info()

      // vesting
      if (pool.vestingAddress && pool.vestingChainId === walletStore.chainId) {
        const vestingContract = new VestingHandler(pool.vestingAddress, pool.vestingChainId)
        vestingContract.load(pool)
        this.vestingContract = vestingContract
      }
    } catch (error) {
      snackController.commonError(error)
    }

    this._diposers = [
      reaction(
        () => this.progress,
        () => this.updatePoolState(),
        { fireImmediately: true }
      ),
      reaction(
        () => walletStore.account,
        () => this.handleAccountChanged(),
        { fireImmediately: true }
      ),
      reaction(
        () => walletStore.account,
        () => {
          if (walletStore.account && walletStore.chainId === this.chainId) {
            if (this.vestingAddress) this.vestingContract?.injectMetamaskWeb3(walletStore.web3!)
            else this.contract?.injectMetamaskWeb3(walletStore.web3!)
          }
        },
        { fireImmediately: true }
      )
    ]
    interval(1000)
      .pipe(
        takeUntil(this._unsubcrible),
        takeWhile(() => !this.poolState || !this.poolState.ended)
      )
      .subscribe(() => {
        this.updatePoolState()
      })
    interval(10000)
      .pipe(
        takeUntil(this._unsubcrible),
        takeWhile(() => !this.poolState || !this.poolState.ended)
      )
      .subscribe(() => {
        if (!this.purchasedTokens.isZero() && bigNumberHelper.gt(this.totaltokens, this.purchasedTokens)) {
          this.setPurchasedTokens()
        }
      })
    interval(10000)
      .pipe(
        takeUntil(this._unsubcrible),
        takeWhile(() => !!this.pool?.address && !this.isFinalized)
      )
      .subscribe(() => {
        const contract = this.contract
        if (contract) {
          contract.isFinalized().then(val => this.changeState({ isFinalized: val }))
        }
      })

    if (this.vestingAddress) this.changeState({ isFinalized: true })
  }

  @action.bound loadDataIfNeed() {
    if (this.loaded) return
    this.loaded = true
    this.loadData()
  }

  async loadData() {
    const contract = this.contract
    if (contract) {
      await contract.assertERC20Info()
      contract.getBuyerLength().then(length => {
        let participants = max([length, this.pool.data?.participants || 0])
        if (this.pool.data?.baseParticipants) {
          participants = +length + +this.pool.data?.baseParticipants
        }

        this.changeState({ participants })
      })

      contract.tokensForSale().then(async val => {
        this.changeState({ totaltokens: FixedNumber.from(val) })
        await this.setPurchasedTokens()
      })
      contract.isTokenSwapAtomic().then(val => this.changeState({ isAtomicSwap: val }))
      contract.isFinalized().then(val => this.changeState({ isFinalized: val }))
      contract.hasWhitelisting().then(val => this.changeState({ hasWhitelist: val }))
    }
    this.updatePoolState()
  }

  async setPurchasedTokens() {
    let purchasedTokens = await this.contract?.tokensAllocated().then(val => FixedNumber.from(val))

    const basePercent = this.pool?.data?.baseProgressPercent
    const forcePercent = this.pool?.data?.forceProgressPercent

    if (forcePercent && forcePercent > 0 && forcePercent <= 100) {
      const bnForcePercent = FixedNumber.from(`${forcePercent}`)
      const percent = purchasedTokens.mulUnsafe(FixedNumber.from(100)).divUnsafe(this.totaltokens)
      if (bigNumberHelper.lt(percent, bnForcePercent)) {
        purchasedTokens = this.totaltokens.mulUnsafe(bnForcePercent).divUnsafe(FixedNumber.from(100))
      }
    } else if (basePercent && basePercent >= 0 && basePercent < 100) {
      const bnBasePercent = FixedNumber.from(`${basePercent}`)
      purchasedTokens = this.totaltokens
        .mulUnsafe(bnBasePercent)
        .divUnsafe(FixedNumber.from(100))
        .addUnsafe(purchasedTokens)

      if (bigNumberHelper.gt(purchasedTokens, this.totaltokens)) {
        purchasedTokens = this.totaltokens
      }
    }

    this.changeState({ purchasedTokens })
  }

  @asyncAction *handleAccountChanged() {
    try {
      const account = walletStore.account
      if (account && this.contract) {
        yield this.contract.assertERC20Info()
        this.isWhitelisted = yield this.contract!.isWhitelisted({ address: account })
        this.maxPurchaseBnb = yield this.contract!.individualMaximumAmount().then(val => {
          return FixedNumber.from(val).mulUnsafe(FixedNumber.from(this.ratio))
        })
      } else {
        this.isWhitelisted = false
      }
    } catch (error) {
      //
    }
  }

  @asyncAction *updatePoolState() {
    this.poolState = yield getPoolState(this)
  }

  @action.bound changeModel(model: FixedPoolModel) {
    this.pool = model
    this.loaded = false
  }

  @action changeState(changes: {
    pool?: FixedPoolModel
    maxPurchaseBnb?: FixedNumber
    participants?: number
    purchasedTokens?: FixedNumber
    totaltokens?: FixedNumber
    isAtomicSwap?: boolean
    isFinalized?: boolean
    hasWhitelist?: boolean
    isWhitelisted?: boolean
  }) {
    if ('maxPurchaseBnb' in changes) this.maxPurchaseBnb = changes.maxPurchaseBnb!
    if ('participants' in changes) this.participants = changes.participants!
    if (this.pool.tokenName !== 'SB') {
      if ('purchasedTokens' in changes) this.purchasedTokens = changes.purchasedTokens!
      if ('totaltokens' in changes) this.totaltokens = changes.totaltokens!
    } else {
      if ('purchasedTokens' in changes) this.purchasedTokens = FixedNumber.from(this.pool.totalRaise)
      if ('totaltokens' in changes) this.totaltokens = FixedNumber.from(this.pool.totalRaise)
    }
    if ('isAtomicSwap' in changes) this.isAtomicSwap = changes.isAtomicSwap!
    if ('isFinalized' in changes) this.isFinalized = changes.isFinalized!
    if ('hasWhitelist' in changes) this.hasWhitelist = changes.hasWhitelist!
    if ('isWhitelisted' in changes) this.isWhitelisted = changes.isWhitelisted!
  }

  @computed get progress() {
    if (this.purchasedTokens.isZero() || this.totaltokens.isZero()) return 0
    const result = this.purchasedTokens.divUnsafe(this.totaltokens).mulUnsafe(FixedNumber.from(100))
    return +result.toUnsafeFloat().toFixed(6)
  }

  @computed get startIn() {
    if (this.poolState) {
      const { startDuration } = this.poolState
      return `in ${formatDuration(startDuration)}`
    }
    return ''
  }

  @computed get canRedeemTokens() {
    return this.isFinalized && !this.isTBARedeem
  }

  @computed get maxPoolBnb() {
    if (this.pool?.ratio) {
      return this.totaltokens.mulUnsafe(FixedNumber.from(this.ratio))
    }
    return ''
  }

  @computed get minAllocationUsd() {
    return this.pool?.data?.minAllocationUsd
  }
  @computed get maxAllocationUsd() {
    return this.pool?.data?.maxAllocationUsd
  }
  @computed get totalRaiseUsd() {
    return this.pool?.data?.totalRaiseUsd
  }
  @computed get shortDescription() {
    return this.pool?.data?.shortDescription
  }
  @computed get medium() {
    return this.pool?.data?.medium
  }
  @computed get telegram() {
    return this.pool?.data?.telegram
  }
  @computed get twitter() {
    return this.pool?.data?.twitter
  }
  @computed get web() {
    return this.pool?.data?.web
  }
  @computed get facebook() {
    return this.pool?.data?.facebook
  }
  @computed get instagram() {
    return this.pool?.data?.instagram
  }
  @computed get reddit() {
    return this.pool?.data?.reddit
  }
  @computed get telegramChat() {
    return this.pool?.data?.telegramChat
  }
  @computed get github() {
    return this.pool?.data?.github
  }
  @computed get youtube() {
    return this.pool?.data?.youtube
  }
  @computed get discord() {
    return this.pool?.data?.discord
  }
  @computed get whitelistUrl() {
    return this.pool?.data?.whitelistUrl
  }
  @computed get isTBAStartDate() {
    if (!this.pool?.data?.startDate) return false
    return this.pool?.data?.startDate === 'TBA'
  }
  @computed get isTBARedeem() {
    return this.pool?.data?.isTBARedeem
  }
  @computed get maxPurchaseBnb4Display() {
    return FixedNumber.from(this.pool?.maxAllocation || '0').mulUnsafe(FixedNumber.from(this.ratio))
  }
  @computed get tradeToken() {
    return this.pool?.tradeToken || 'BNB'
  }
  @computed get tradeByErc20() {
    return this.type === 'v3' || this.type === 'v4' || this.type === 'v5'
  }
  @computed get type() {
    return this.pool?.type
  }
  @computed get requiredBsl() {
    return this.type !== 'v1'
  }
  @computed get token2TradeToken() {
    return this.pool?.ratio ? 1 / +this.pool?.ratio.toFixed(10) : ''
  }
  @computed get chainId() {
    if (this.vestingAddress) return this.vestingChainId
    return this.pool?.chainId || 56
  }
  @computed get showRefund() {
    return this.pool?.data?.showRefund
  }
  @computed get hideParticipants() {
    return this.pool?.data?.hideParticipants
  }
  @computed get hideContractAddress() {
    return this.pool?.data?.hideContractAddress
  }
  @computed get ratio() {
    return this.pool?.ratio ? this.pool?.ratio?.toFixed(10) : '1'
  }
  @computed get ratioFn() {
    try {
      return FixedNumber.from(this.ratio)
    } catch (error) {
      return FixedNumber.from('1')
    }
  }
  @computed get vestingAddress() {
    return this.pool?.vestingAddress
  }
  @computed get vestingNetwork() {
    return this.pool?.vestingNetwork
  }
  @computed get vestingChainId() {
    return this.pool?.vestingChainId
  }
  @computed get allowRefundUsd() {
    return this.vestingContract?.allowRefundUsd
  }
  @computed get isTBAPrice() {
    return this.pool?.ratio ? this.pool?.ratio <= 0 : true
  }
  destroy() {
    this._diposers.forEach(d => d())
    this._unsubcrible.next()
    this._unsubcrible.complete()
  }
}
