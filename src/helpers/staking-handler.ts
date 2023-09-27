/* eslint-disable prettier/prettier */
import { FixedNumber } from '@ethersproject/bignumber'
import moment, { Moment } from 'moment'
import Web3 from 'web3'
import { blockchainHandler } from '@/blockchain'
import { promiseHelper } from './promise-helper'
import { YEAR_IN_SECONDS, Zero, fn100 } from '@/constants'
import { bigNumberHelper } from './bignumber-helper'
import { loadingController } from '@/components/global-loading/global-loading-controller'
import { snackController } from '@/components/snack-bar/snack-bar-controller'

const web3 = blockchainHandler.getWeb3(process.env.VUE_APP_CHAIN_ID)!

async function sendRequest(fx, from) {
  return await new Promise((resolve, reject) => {
    fx.send({
      from
      // gasPrice: web3.utils.toWei('11', 'gwei')
    })
      .on('receipt', () => resolve(''))
      .on('error', error => reject(error))
  })
}

export class ApyConfig {
  duration?: number
  apy?: FixedNumber
}

export class UserInfo {
  amount?: FixedNumber
  lastStakeTime?: Moment
  lockDuration?: string
  rewardAmount?: FixedNumber
  lastRewardTime?: number
}

export class StakingHandler {
  stakeContract: any
  poolTokenContract: any
  lockDuration?: moment.Duration
  apy = Zero
  totalAmount = Zero

  rewardToken?: string
  poolToken?: string
  web3: any
  // apyConfigs: ApyConfig[] = [
  //   {
  //     duration: 2 * 60, // 2m
  //     apy: FixedNumber.from('150') // 150%
  //   }
  // ]
  rewardDecimals = +process.env.VUE_APP_STAKE_REWARD_DECIMAL!

  constructor() {
    this.stakeContract = new web3.eth.Contract(require('./stake.abi.json'), process.env.VUE_APP_STAKE_ADDRESS)
  }

  async load() {
    loadingController.increaseRequest()
    try {
      const [totalAmount, apyConfigs] = await blockchainHandler.etherBatchRequest(web3, [
        this.stakeContract.methods.totalAmount(),
        this.stakeContract.methods.getApyConfigs()
      ])
      this.totalAmount = bigNumberHelper.fromDecimals(totalAmount)
      this.poolToken = this.rewardToken = web3.utils.toChecksumAddress(`${process.env.VUE_APP_STAKE_REWARD_ADDRESS}`)
      this.poolTokenContract = new web3.eth.Contract(require('./erc20.abi.json'), this.poolToken)
      this.lockDuration = moment.duration((apyConfigs as any)[0].duration, 'seconds')
      this.apy = bigNumberHelper.fromDecimals((apyConfigs as any)[0].apy)
    } catch (error) {
      snackController.commonError(error)
    } finally {
      loadingController.decreaseRequest()
    }
  }

  async getTotalLockedAmount() {
    const amount = await this.stakeContract.methods.totalAmount().call()
    return bigNumberHelper.fromDecimals(amount)
  }

  injectMetamask(web3: Web3) {
    if (web3) {
      this.web3 = web3
      this.stakeContract = new web3.eth.Contract(require('./stake.abi.json'), process.env.VUE_APP_STAKE_ADDRESS)
      this.poolTokenContract = new web3.eth.Contract(require('./erc20.abi.json'), this.poolToken)
    }
  }

  async approved(account, index = 3) {
    try {
      const allowance = await this.poolTokenContract.methods
        .allowance(account, process.env.VUE_APP_STAKE_ADDRESS)
        .call()
      return !!+Web3.utils.fromWei(allowance)
    } catch (error) {
      if (index) {
        await promiseHelper.delay(200)
        return await this.approved(account, --index)
      }
      console.error(error)
      return false
    }
  }

  async approve(account) {
    const f = this.poolTokenContract.methods.approve(
      process.env.VUE_APP_STAKE_ADDRESS,
      web3.utils.toWei(`${2 ** 32 - 1}`)
    )
    await sendRequest(f, account)
  }
  async stake(account, amount) {
    const f = this.stakeContract.methods.deposit(
      bigNumberHelper.toDecimalString(`${amount.toString()}`, this.rewardDecimals),
      this.lockDuration?.asSeconds()
    )

    await sendRequest(f, account)
  }

  async havest(account) {
    const f = this.stakeContract.methods.harvest()
    await sendRequest(f, account)
  }

  async unstake(account) {
    const f = this.stakeContract.methods.withdraw()
    await sendRequest(f, account)
  }
  async getUserInfo(account) {
    const {
      0: amount,
      1: rewardAmount,
      2: lockedAt,
      3: lastRewardTime,
      4: lockDuration
    } = await this.stakeContract.methods.userInfos(account).call()
    return {
      amount: FixedNumber.from(`${web3.utils.fromWei(amount)}`),
      lastStakeTime: +lockedAt ? moment(+lockedAt * 1000) : null,
      lockDuration,
      rewardAmount: FixedNumber.from(`${web3.utils.fromWei(rewardAmount)}`),
      lastRewardTime: +lastRewardTime
    }
  }

  async getUserTokenBalance(account) {
    const allowance = await this.poolTokenContract.methods.balanceOf(account).call()
    return FixedNumber.from(`${web3.utils.fromWei(allowance)}`)
  }

  async getPendingReward(account) {
    const amount = await this.stakeContract.methods.getPendingReward(account).call()
    return FixedNumber.from(`${web3.utils.fromWei(amount)}`)
  }
}

export const stakingHandler = new StakingHandler()
