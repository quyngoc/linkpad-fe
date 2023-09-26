import { action, computed, IReactionDisposer, observable, reaction, runInAction, when } from 'mobx'
import { asyncAction } from 'mobx-utils'
import { walletStore } from '@/stores/wallet-store'
import { apiService } from '@/services/api-service'
import { FixedPoolModel } from '@/models/fixed-pool-model'
import { from, Subject, Subscription, timer } from 'rxjs'
import FixedSwapContract, { FixedSwapContractPurchase } from '@/libs/models/FixedSwapContract'
import { getContract } from '../business/swap-contract.business'
import { snackController } from '@/components/snack-bar/snack-bar-controller'
import moment from 'moment'
import { get } from 'lodash-es'
import { concatMap, takeUntil, takeWhile } from 'rxjs/operators'
import { FixedNumber } from '@ethersproject/bignumber'
import { Zero } from '@/constants'
import { VestingHandler } from '@/helpers/vesting-handler'
import { promiseHelper } from '@/helpers/promise-helper'

export class PurchasedItemViewModel {
  @observable claiming = false
  @observable claimed = false
  @observable refunded = false
  @observable poolFinalized = false
  @observable currentTime = moment()

  private _unscrible = new Subject()

  constructor(
    public purchase: FixedSwapContractPurchase,
    private contract: FixedSwapContract | VestingHandler | undefined,
    private isAtomicSwap: boolean,
    isPoolFinalized: boolean,
    private poolItemViewModel: PoolItemViewModel
  ) {
    this.claimed = purchase.wasFinalized
    this.poolFinalized = isPoolFinalized
    this.refunded = purchase.refunded
    if (!this.claimed && this.purchase.validAfterDate) {
      // remain 30minutes => claim => timer
      const validAfter = moment(this.purchase.validAfterDate)
      if (
        !isPoolFinalized ||
        (this.currentTime.isBefore(validAfter) &&
          this.currentTime
            .clone()
            .add(30, 'minutes')
            .isAfter(validAfter))
      ) {
        timer(0, 5000)
          .pipe(takeUntil(this._unscrible))
          .subscribe(() => {
            runInAction(() => (this.currentTime = moment()))
          })
      }
    }
  }

  @asyncAction *claimToken() {
    this.claiming = true
    try {
      if (this.canRedeemTokens) {
        yield this.contract?.redeemTokens({ purchase_id: this.purchase._id })
        yield this.poolItemViewModel.loadDetailPurchases(true)
        snackController.success('Claim successful')
        this.claimed = true
      }
    } catch (error) {
      snackController.commonError(error)
    } finally {
      this.claiming = false
    }
  }

  @computed get canPoolRedeem() {
    return !this.isAtomicSwap && this.poolFinalized
  }

  @computed get canRedeemTokens() {
    let ok = this.canPoolRedeem && !!this.purchase.validAfterDate
    ok = ok && this.currentTime.isAfter(moment(this.purchase.validAfterDate))
    return ok
  }

  destroy() {
    this._unscrible.next()
    this._unscrible.complete()
  }
}

export class PoolItemViewModel {
  @observable purchases: PurchasedItemViewModel[] = []

  contract?: FixedSwapContract
  vestingContract?: VestingHandler

  @observable loading = false
  @observable isBuyer = false
  @observable refunding = false
  @observable purchasedToken = Zero
  private _checkFinializedSubscription?: Subscription

  private _disposers: IReactionDisposer[] = []

  constructor(public model: FixedPoolModel) {
    this.contract = getContract(model)!

    if (model.vestingAddress && model.vestingChainId) {
      const vestingContract = new VestingHandler(model.vestingAddress, model.vestingChainId)
      vestingContract.load(model)
      this.vestingContract = vestingContract
    }
    this._disposers = [
      when(
        () => walletStore.connected,
        () => {
          if (walletStore.chainId === this.chainId) {
            if (model.vestingAddress) {
              this.vestingContract?.injectMetamaskWeb3(walletStore.web3!)
            } else {
              this.contract?.injectMetamaskWeb3(walletStore.web3!)
            }
          }
        }
      )
    ]
  }

  @asyncAction *checkBuyer() {
    try {
      if (this.model?.vestingAddress) {
        if (!this.vestingContract) return
        yield this.vestingContract?.getUserInfo()
        this.isBuyer = !!this.vestingContract?.userInfo?.isBuyer
      } else {
        if (!this.contract) return
        this.isBuyer = yield this.contract?.isBuyer(walletStore.account)
      }
    } catch (error) {
      console.error(error)
    }
  }

  @asyncAction *getBoughtAmount() {
    try {
      this.refunding = true
      if (this.model.vestingAddress) {
        this.purchasedToken = this.vestingContract?.userInfo.amount!
      } else {
        this.purchasedToken = yield this.contract?.getBoughtAmount(walletStore.account)
      }
    } catch (error) {
      snackController.commonError(error)
    } finally {
      this.refunding = false
    }
  }

  @asyncAction *loadDetailPurchases(forceUpdate = false) {
    this.loading = true
    let dynamicContract: VestingHandler | FixedSwapContract | undefined
    let purchases: FixedSwapContractPurchase[] = []

    try {
      if (this.model.vestingAddress) {
        const vestingContract = this.vestingContract

        dynamicContract = vestingContract
        if (vestingContract && walletStore.account) {
          if (forceUpdate) {
            yield vestingContract.getUserInfo()
            yield vestingContract.getSchedules()
          }
          purchases = vestingContract.schedules
        }
      } else {
        dynamicContract = this.contract
        if (!dynamicContract || !this.isBuyer) return
        yield dynamicContract.assertERC20Info()
        const purchaseIds = yield this.contract?.getAddressPurchaseIds({ address: walletStore.account })

        purchases = yield Promise.all(purchaseIds.map(purchase_id => this.contract?.getPurchase({ purchase_id })))
        const pendingPurchase: FixedSwapContractPurchase = yield dynamicContract.getPendingPurchase()
        if (!FixedNumber.from(pendingPurchase.amount).isZero()) {
          purchases.push(pendingPurchase)
        }
      }

      const isAtomicSwap = yield this.contract?.isTokenSwapAtomic()
      let isFinalized = yield this.contract!.isFinalized()

      this.purchases = purchases
        .filter(p => this.model?.tokenName !== 'SON' || (p._id as any) !== -1)
        .map((p, index) => {
          if (this.model.tokenName === 'SFEX') {
            p.validAfterDate = moment(p.validAfterDate)
              .add(4, 'hour')
              .add(10, 'minutes')
              .toDate()
            if (index === 0) p.wasFinalized = true
          }
          return new PurchasedItemViewModel(p, dynamicContract, isAtomicSwap, isFinalized, this)
        })
      if (!isFinalized) {
        this._checkFinializedSubscription?.unsubscribe()
        this._checkFinializedSubscription = timer(5000, 5000)
          .pipe(takeWhile(() => !isFinalized))
          .subscribe(async () => {
            isFinalized = await this.contract?.isFinalized()
            if (isFinalized) {
              runInAction(() => this.purchases.forEach(p => (p.poolFinalized = isFinalized)))
            }
          })
      }
    } catch (err) {
      snackController.commonError(err)
      console.error(err)
    } finally {
      this.loading = false
    }
  }

  @asyncAction *refund() {
    let contract: FixedSwapContract | VestingHandler | undefined
    if (this.model?.vestingAddress) contract = this.vestingContract
    else contract = this.contract

    this.refunding = true
    try {
      yield contract?.refund()
      yield this.loadDetailPurchases(true)
      let msg = 'Refund successful'
      if (this.model?.vestingAddress && !!this.vestingContract?.allowRefundUsd) msg = 'Register refund successful'
      snackController.success(msg)
    } catch (error) {
      snackController.commonError(error)
    } finally {
      this.refunding = false
    }
  }

  destroy() {
    this._checkFinializedSubscription?.unsubscribe()
    this.purchases.forEach(p => p.destroy())
    this._disposers.forEach(d => d())
  }

  @computed get isBslHolderType() {
    return this.model?.type !== 'v1'
  }

  @computed get tradeToken() {
    return this.model?.tradeToken || 'BNB'
  }

  @computed get claimAirdrop() {
    return this.model?.data?.claimType === 'airdrop'
  }

  @computed get chainId() {
    if (this.model.vestingAddress) return this.model?.vestingChainId
    return this.model?.chainId
  }

  @computed get isTBARedeem() {
    return this.model?.data?.isTBARedeem
  }

  @computed get poolId() {
    return this.model?.id
  }

  @computed get forceRefund() {
    return this.model?.data?.forceRefund
  }
  @computed get firstPurchase() {
    const firstPurchase = this.purchases && this.purchases[0]
    if (get(firstPurchase, 'purchase.validAfterDate')) {
      const purchase = firstPurchase.purchase
      return purchase
    }
  }
  @computed get refundEndTime() {
    return this.firstPurchase?.refundEnd
  }
  @computed get showRefundCountdown() {
    if (this.model?.data?.showRefund) {
      const claimStarted = moment().isAfter(moment(this.firstPurchase?.validAfterDate))
      const refundValidTime = moment().isBetween(
        moment(this.firstPurchase?.refundStart),
        moment(this.firstPurchase?.refundEnd)
      )

      return refundValidTime && claimStarted && !this.firstPurchase?.refunded && !this.firstPurchase?.wasFinalized
    }
    return false
  }
  @computed get canRefund() {
    const claimStarted = moment().isAfter(moment(this.firstPurchase?.validAfterDate))
    const refundValidTime = moment().isBetween(
      moment(this.firstPurchase?.refundStart),
      moment(this.firstPurchase?.refundEnd)
    )

    return refundValidTime && claimStarted
  }

  @computed get isShowRefundButton() {
    if (this.model?.data?.showRefund) {
      const result =
        !this.firstPurchase?.refunded && +(this.firstPurchase?.amount || 0) && !this.firstPurchase?.wasFinalized
      return result
    }

    return false
  }

  @computed get purchasedBnb() {
    try {
      return this.purchasedToken.mulUnsafe(FixedNumber.from(this.model?.ratio?.toFixed(10)))
    } catch (error) {
      return Zero
    }
  }

  @computed get allowRefundUsd() {
    return this.vestingContract?.allowRefundUsd
  }
}

export class AllAllocationsViewModel {
  private _poolLoaderQueue = new Subject<PoolItemViewModel>()
  private _unscrible = new Subject()
  @observable loading = false
  @observable _page = 0
  @observable tokenClaiming = false
  private _itemsPerPage = 10

  _disposers: IReactionDisposer[]

  constructor() {
    this._disposers = [
      when(
        () => walletStore.connected,
        () => this.fetchPools()
      )
    ]
    this._poolLoaderQueue
      .pipe(
        takeUntil(this._unscrible),
        concatMap(p => from(p.loadDetailPurchases(true) as any))
      )
      .subscribe()
  }

  @observable allPools: PoolItemViewModel[] = []
  @observable totalCount = 0;

  @asyncAction *fetchPools() {
    this.loading = true
    try {
      if (!walletStore.connected) {
        snackController.error('Please connect wallet first')
      } else {
        let results = []
        const _start = this._page++ * this._itemsPerPage
        const params = {
          _start,
          _limit: this._itemsPerPage,
          _sort: 'index:DESC'
        }
        results = yield Promise.all([apiService.fixedPool.find(params), apiService.fixedPool.count({})])

        const allPools = (results[0] as FixedPoolModel[]).map(p => new PoolItemViewModel(p))
        if (!allPools || !allPools.length) return

        yield Promise.all(allPools.map(p => p.checkBuyer()))

        const filteredPools = [...allPools.filter(p => p.isBuyer)]
        if (!filteredPools.length) {
          yield promiseHelper.delay(500)
          yield this.fetchPools()
        } else {
          this.allPools = [...this.allPools, ...filteredPools]
          filteredPools.forEach(p => this._poolLoaderQueue.next(p))
          this.totalCount = results[1]
        }
      }
    } finally {
      this.loading = false
    }
  }

  async destroy() {
    this._unscrible.next()
    this._unscrible.complete()
    this.allPools.forEach(p => p.destroy())
  }

  @action.bound setClaiming(val: boolean) {
    this.tokenClaiming = val
  }

  @computed get canLoadMore() {
    return this.loading || !this.totalCount || this._page * this._itemsPerPage < this.totalCount
  }
}
