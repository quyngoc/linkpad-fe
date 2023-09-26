import { loadingController } from '@/components/global-loading/global-loading-controller'
import { snackController } from '@/components/snack-bar/snack-bar-controller'
import { Zero } from '@/constants'
import { bigNumberHelper } from '@/helpers/bignumber-helper'
import { FarmHandler } from '@/helpers/farm-handler'
import { apiService } from '@/services/api-service'
import { walletStore } from '@/stores/wallet-store'
import { FixedNumber } from '@ethersproject/bignumber'
import { action, computed, IReactionDisposer, observable, reaction, runInAction, when } from 'mobx'
import { asyncAction } from 'mobx-utils'
import moment from 'moment'
import { Subject, timer } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

export class FarmViewModel {
  _disposers: IReactionDisposer[] = []
  private _unsubcrible = new Subject()

  @observable farmDialogInput = ''
  @observable isShowFarmDialog = false
  @observable isDialogFarm = false
  @observable isDialogLoading = false

  @observable approved = false
  @observable approving = false
  @observable harvesting = false

  @observable lockDuration = moment.duration(0, 'second') // in seconds
  @observable totalLiquidity = FixedNumber.from('0')
  @observable annualPercentageRate = FixedNumber.from('0')

  @observable stakedLP = FixedNumber.from('0')
  @observable userLPBalance = FixedNumber.from('0')
  @observable rewardAmount = FixedNumber.from('0')
  @observable lastStakeTime: moment.Moment | null = null
  farmHandler?: FarmHandler

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
    const farmHandler = new FarmHandler()
    this.farmHandler = farmHandler
    try {
      await farmHandler.load()
    } catch (error) {
      console.error('loadData', error)
    }
    if (this.destroyed) return
    this.lockDuration = farmHandler.lockDuration!
    // return
    timer(0, 120000)
      .pipe(takeUntil(this._unsubcrible))
      .subscribe(async () => {
        const res = await apiService.getFarmInfo()
        runInAction(() => {
          this.totalLiquidity = FixedNumber.from(res.tvl)
          this.annualPercentageRate = FixedNumber.from(res.apy)
        })
      })
    this._disposers.push(
      when(
        () => walletStore.connected,
        async () => {
          const farmChainId = +process.env.VUE_APP_FARM_CHAIN_ID!
          if (walletStore.chainId === farmChainId) {
            farmHandler.injectMetamask(walletStore.web3!)
            farmHandler.approved(walletStore.account).then(approved => runInAction(() => (this.approved = approved)))
            this.fetchPoolInfo()

            // timer(0, 5000)
            //   .pipe(takeUntil(this._unsubcrible))
            //   .subscribe(async () => {
            //     this.getPendingReward()
            //   })
          }
        }
      )
    )
  }

  async fetchPoolInfo() {
    if (!walletStore.account || !this.farmHandler) {
      this.stakedLP = FixedNumber.from('0')
    } else {
      const result = await this.farmHandler.getUserInfo(walletStore.account)
      this.stakedLP = result.amount
      this.lastStakeTime = result.lastStakeTime
      this.userLPBalance = result.userLPBalance
      this.rewardAmount = result.rewardAmount
    }
  }

  @asyncAction *harvest() {
    this.harvesting = true
    try {
      yield this.farmHandler!.harvest(walletStore.account)
      this.fetchPoolInfo()
      snackController.success('Harvest successful')
    } catch (error) {
      snackController.commonError(error)
    }
    this.harvesting = false
  }

  @asyncAction *approve() {
    this.approving = true
    try {
      yield this.farmHandler!.approve(walletStore.account)
      this.approved = true
    } catch (error) {
      snackController.commonError(error)
    }
    this.approving = false
  }

  @action.bound changeFarmDialogInput(input) {
    this.farmDialogInput = input
  }

  @action.bound requestStakeLP() {
    this.isShowFarmDialog = true
    this.isDialogFarm = true
  }

  @action.bound requestUnstakeLP() {
    this.isShowFarmDialog = true
    this.isDialogFarm = false
  }

  @action.bound maximum() {
    this.farmDialogInput = this.maxDialogFarmBalance.toString()
  }

  @asyncAction *confirm() {
    this.isDialogLoading = true
    try {
      if (this.isDialogFarm) {
        yield this.farmHandler!.stakeLP(walletStore.account, this.farmDialogInput)
        snackController.success('Stake LP successful')
      } else {
        yield this.farmHandler!.unstakeLP(walletStore.account, this.farmDialogInput)
        snackController.success('Unstake LP successful')
      }
      this.fetchPoolInfo()
      this.cancelFarmDialog()
    } catch (err) {
      snackController.commonError(err)
    } finally {
      this.isDialogLoading = false
    }
  }

  @action.bound cancelFarmDialog() {
    this.farmDialogInput = '0'
    this.isShowFarmDialog = false
  }

  @computed get isStaked() {
    return bigNumberHelper.gt(this.stakedLP, FixedNumber.from('0'))
  }

  @computed get maxDialogFarmBalance() {
    return this.isDialogFarm ? this.userLPBalance : this.stakedLP
  }

  @computed get lockInDays() {
    return this.lockDuration.asDays()
  }

  @computed get canUnstakeTime() {
    if (this.lastStakeTime) {
      return this.lastStakeTime.clone().add(this.lockDuration)
    }
    return null
  }

  @computed get unstakeTime() {
    return this.lastStakeTime?.clone().add(this.lockDuration)
  }

  @computed get canHarvest() {
    return bigNumberHelper.gt(this.rewardAmount, Zero) && this.unstakeTime && this.unstakeTime.isBefore(moment())
  }

  @computed get validDialogInputAmount() {
    try {
      const amount = FixedNumber.from(this.farmDialogInput)
      if (!this.isDialogFarm && this.canUnstakeTime && this.canUnstakeTime.isAfter(moment())) return false
      if (amount.isNegative() || amount.isZero()) return false
      if (this.isDialogFarm) {
        return bigNumberHelper.lte(amount, this.userLPBalance)
      } else {
        return bigNumberHelper.lte(amount, this.stakedLP)
      }
    } catch (error) {
      return false
    }
  }

  @computed get showUnstakeTime() {
    return this.isStaked || this.canHarvest || this.canUnstake
  }

  @computed get canUnstake() {
    return moment().isAfter(this.unstakeTime) && this.isStaked
  }
  @computed get estimatedUnstakeTime() {
    return moment().add(this.lockDuration)
  }
  @computed get estimateTotalStake() {
    try {
      const stakeInputAmount = FixedNumber.from(this.farmDialogInput)
      const amount = stakeInputAmount.addUnsafe(this.stakedLP)
      return amount
    } catch (error) {
      return Zero
    }
  }
}
