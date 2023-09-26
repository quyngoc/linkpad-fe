/* eslint-disable prettier/prettier */
import { FixedNumber } from '@ethersproject/bignumber'
import moment, { Moment } from 'moment'
import Web3 from 'web3'
import { blockchainHandler } from '@/blockchain'
import { promiseHelper } from './promise-helper'
import { YEAR_IN_SECONDS, fn100 } from '@/constants'
import { bigNumberHelper } from './bignumber-helper'

const web3 = blockchainHandler.getWeb3(process.env.VUE_APP_FARM_CHAIN_ID)!

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

  rewardToken?: string
  poolToken?: string
  web3: any
  apyConfigs: ApyConfig[] = [
    {
      duration: 15 * 24 * 60 * 60, // 15 days
      apy: FixedNumber.from('150') // 150%
    }
  ]
  rewardDecimals = +process.env.VUE_APP_STAKE_REWARD_DECIMAL!

  constructor() {
    this.stakeContract = new web3.eth.Contract(require('./stake.abi.json'), process.env.VUE_APP_STAKE_ADDRESS)
  }

  load() {
    // const [apyConfigs] = await blockchainHandler.etherBatchRequest(web3, [this.stakeContract.methods.getApyConfigs()])
    // console.log('apyConfigs: ', apyConfigs)

    this.poolToken = this.rewardToken = web3.utils.toChecksumAddress(`${process.env.VUE_APP_STAKE_REWARD_ADDRESS}`)
    this.poolTokenContract = new web3.eth.Contract(require('./erc20.abi.json'), this.poolToken)
    this.lockDuration = moment.duration(this.apyConfigs[0].duration, 'seconds')
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
      this.apyConfigs![0].duration
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

  estimatedReward({ amount, rewardAmount, lastRewardTime }) {
    const timeDiff = FixedNumber.from(`${Date.now() / 1000 - lastRewardTime}`)

    const pendingReward = timeDiff
      .mulUnsafe(amount)
      .divUnsafe(FixedNumber.from(YEAR_IN_SECONDS.toString()))
      .mulUnsafe(this.apyConfigs[0].apy!)
      .divUnsafe(fn100)
    return pendingReward.addUnsafe(rewardAmount)
  }

  async getUserTokenBalance(account) {
    const allowance = await this.poolTokenContract.methods.balanceOf(account).call()
    return FixedNumber.from(`${web3.utils.fromWei(allowance)}`)
  }
}

export const stakingHandler = new StakingHandler()
