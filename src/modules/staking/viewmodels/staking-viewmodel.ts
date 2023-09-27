import { snackController } from '@/components/snack-bar/snack-bar-controller'
import { tier2, tier3, tier1, tier4, noTier, Zero } from '@/constants'
import { bigNumberHelper } from '@/helpers/bignumber-helper'
import { promiseHelper } from '@/helpers/promise-helper'
import { StakingHandler, UserInfo } from '@/helpers/staking-handler'
import { apiService } from '@/services/api-service'
import { walletStore } from '@/stores/wallet-store'
import { FixedNumber } from '@ethersproject/bignumber'
import { action, computed, IReactionDisposer, observable, reaction, runInAction, when } from 'mobx'
import { asyncAction } from 'mobx-utils'
import moment from 'moment'
import { Subject, timer } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

export class StakingViewModel {
  _disposers: IReactionDisposer[] = []
  private _unsubcrible = new Subject()

  @observable stakeDialogInput = ''
  @observable isShowStakeDialog = false
  @observable isDialogStaking = false
  @observable isDialogLoading = false

  @observable approved = false
  @observable approving = false

  @observable lockDuration = moment.duration(0, 'second') // in seconds

  @observable stakedAmount = Zero
  @observable userTokenBalance = Zero
  @observable lastStakeTime: moment.Moment | null = null
  @observable totalLockedAmount = Zero
  stakingHandler?: StakingHandler

  @observable tvl = Zero
  @observable pendingReward = Zero
  @observable havesting = false
  @observable showHavestDialog = false
  @observable userInfo: UserInfo = {}

  constructor() {
    this.loadData()

    this._disposers = [
      reaction(
        () => walletStore.account,
        () => {
          this.loadData()
        }
      )
    ]
  }

  destroyed = false
  destroy() {
    this.destroyed = true
    this._unsubcrible.next()
    this._unsubcrible.complete()
    this._disposers.forEach(d => d())
  }

  async loadData() {
    const stakingHandler = new StakingHandler()
    this.stakingHandler = stakingHandler
    stakingHandler.load()
    if (this.destroyed) return

    this.lockDuration = stakingHandler.lockDuration!
    this.fetchPoolInfo()
    this.getUserTokenBalance()

    timer(0, 120000)
      .pipe(takeUntil(this._unsubcrible))
      .subscribe(() => {
        this.getStakePoolInfo()
      })

    this._disposers.push(
      when(
        () => walletStore.connected,
        async () => {
          if (walletStore.chainId) {
            stakingHandler.injectMetamask(walletStore.web3!)
            stakingHandler.approved(walletStore.account).then(approved => runInAction(() => (this.approved = approved)))

            timer(0, 5000)
              .pipe(takeUntil(this._unsubcrible))
              .subscribe(() => {
                this.getPendingReward()
              })
          }
        }
      )
    )
  }

  @asyncAction *fetchPoolInfo() {
    yield Promise.all([this.getStakePoolInfo(), this.getUserInfo()])
    this.getPendingReward()
  }

  @asyncAction *getUserInfo() {
    if (walletStore.account) {
      const userInfo = yield this.stakingHandler?.getUserInfo(walletStore.account)
      this.userInfo = userInfo
      this.stakedAmount = userInfo.amount
      this.lastStakeTime = userInfo.lastStakeTime
    }
  }

  @asyncAction *getStakePoolInfo() {
    const stakingInfo = yield apiService.getStakePoolInfo()
    this.totalLockedAmount = FixedNumber.from(stakingInfo.lockedAmount)
    this.tvl = FixedNumber.from(stakingInfo.tvl)
  }

  @asyncAction *getUserTokenBalance() {
    if (walletStore.account) {
      const userTokenBalance = yield this.stakingHandler?.getUserTokenBalance(walletStore.account)
      this.userTokenBalance = userTokenBalance
    }
  }

  @action.bound getPendingReward() {
    if (this.userInfo.amount) {
      try {
        const pendingReward = this.stakingHandler?.estimatedReward(this.userInfo as any)
        this.pendingReward = pendingReward!
      } catch (error) {
        this.pendingReward = Zero
      }
    }
  }

  @asyncAction *approve() {
    this.approving = true
    try {
      yield this.stakingHandler!.approve(walletStore.account)
      this.approved = true
    } catch (error) {
      snackController.commonError(error)
    }
    this.approving = false
  }

  @action.bound changeStakeDialogInput(input) {
    this.stakeDialogInput = input
  }

  @action.bound requestStake() {
    this.isShowStakeDialog = true
    this.isDialogStaking = true
  }

  @action.bound requestUnstake() {
    this.isShowStakeDialog = true
    this.isDialogStaking = false
  }

  @action.bound maximum() {
    this.stakeDialogInput = this.maxDialogStakeBalance.toString()
  }

  @asyncAction *confirm() {
    this.isDialogLoading = true
    try {
      if (this.isDialogStaking) {
        yield this.stakingHandler!.stake(walletStore.account, this.stakeDialogInput)
        snackController.success('Stake Linkpad successful')
      } else {
        yield this.stakingHandler!.unstake(walletStore.account)
        snackController.success('Unstake Linkpad successful')
      }
      this.fetchPoolInfo()
      this.cancelStakeDialog()
    } catch (err) {
      snackController.commonError(err)
    } finally {
      this.isDialogLoading = false
    }
  }

  @asyncAction *havest() {
    this.havesting = true
    try {
      yield this.stakingHandler?.havest(walletStore.account)
      snackController.success('Harvest successful')
      this.setShowHavestDialog(false)
      this.fetchPoolInfo()
    } catch (err) {
      snackController.commonError(err)
    } finally {
      this.havesting = false
    }
  }

  getTier(amount: FixedNumber) {
    if (bigNumberHelper.gte(amount, tier4.requiredAmount)) return tier4
    else if (bigNumberHelper.gte(amount, tier3.requiredAmount)) return tier3
    else if (bigNumberHelper.gte(amount, tier2.requiredAmount)) return tier2
    else if (bigNumberHelper.gte(amount, tier1.requiredAmount)) return tier1
    return noTier
  }

  @action.bound cancelStakeDialog() {
    this.stakeDialogInput = '0'
    this.isShowStakeDialog = false
  }

  @action.bound setShowHavestDialog(value: boolean) {
    this.showHavestDialog = value
  }

  @computed get isStaked() {
    return bigNumberHelper.gt(this.stakedAmount, Zero)
  }

  @computed get maxDialogStakeBalance() {
    return this.isDialogStaking ? this.userTokenBalance : this.stakedAmount
  }

  @computed get lockInDays() {
    return this.lockDuration.asDays()
  }

  @computed get canHavest() {
    return moment().isAfter(this.unstakeTime) && bigNumberHelper.gt(this.pendingReward, Zero)
  }

  @computed get validDialogInputAmount() {
    try {
      const amount = FixedNumber.from(this.stakeDialogInput)
      if (amount.isNegative() || amount.isZero()) return false
      if (this.isDialogStaking) {
        return bigNumberHelper.lte(amount, this.userTokenBalance)
      } else {
        return bigNumberHelper.lte(amount, this.stakedAmount)
      }
    } catch (error) {
      return false
    }
  }

  @computed get unstakeTime() {
    return this.lastStakeTime?.clone().add(this.lockDuration)
  }
  @computed get estimatedUnstakeTime() {
    return moment().add(this.lockDuration)
  }
  @computed get canUnstake() {
    return moment().isAfter(this.unstakeTime) && bigNumberHelper.gt(this.stakedAmount, Zero)
  }
  @computed get showUnstakeTime() {
    return this.isStaked || this.canHavest || this.canUnstake
  }

  @computed get userTier() {
    const amount = this.stakedAmount
    return this.getTier(amount)
  }

  @computed get estimateTotalStake() {
    try {
      const stakeInputAmount = FixedNumber.from(this.stakeDialogInput)
      const amount = stakeInputAmount.addUnsafe(this.stakedAmount)
      return amount
    } catch (error) {
      return Zero
    }
  }

  @computed get estimateUserTier() {
    try {
      const amount = this.estimateTotalStake
      return this.getTier(amount)
    } catch (error) {
      return this.userTier
    }
  }

  @computed get apy() {
    return this.stakingHandler?.apyConfigs[0].apy
  }
}
