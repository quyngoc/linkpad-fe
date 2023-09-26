/* eslint-disable prettier/prettier */
import { FixedNumber } from '@ethersproject/bignumber'
import moment, { Moment } from 'moment'
import Web3 from 'web3'
import { blockchainHandler } from '@/blockchain'
import { bigNumberHelper } from './bignumber-helper'
import { walletStore } from '@/stores/wallet-store'
import { FixedPoolModel } from '@/models/fixed-pool-model'
import Numbers from '@/libs/utils/Numbers'
import { Zero, fn100 } from '@/constants'
import { FixedSwapContractPurchase } from '@/libs/models/FixedSwapContract'

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

export class UserInfo {
  amount?: FixedNumber
  claimed?: FixedNumber
  refunded?: boolean
  isBuyer?: boolean
  isClaimed?: boolean
}

export class VestingHandler {
  vestingContract: any
  web3: any
  vestingContractAddress = ''
  schedules: FixedSwapContractPurchase[] = []
  userInfo: UserInfo = {}
  refundStart?: any
  refundEnd?: any
  pool?: FixedPoolModel
  allowRefundUsd?: boolean

  constructor(vestingContractAddress, vestingChainId) {
    if (vestingContractAddress && vestingChainId) {
      this.web3 = blockchainHandler.getWeb3(vestingChainId)
      this.vestingContractAddress = vestingContractAddress
      this.vestingContract = new this.web3.eth.Contract(require('./schedule.vesting.abi.json'), vestingContractAddress)
    } else {
      throw new Error('Invalid address or chainId')
    }
  }

  async load(pool: FixedPoolModel) {
    this.pool = pool
    await this.getUserInfo()
    if (!this.userInfo.isBuyer) return

    if (pool.data?.showRefund) {
      const [refundStart, refundEnd, allowRefundUsd] = await blockchainHandler.etherBatchRequest(this.web3, [
        this.vestingContract.methods.refundStartTime(),
        this.vestingContract.methods.refundEndTime(),
        this.vestingContract.methods.allowRefundUsd()
      ])
      this.refundStart = refundStart
      this.refundEnd = refundEnd
      this.allowRefundUsd = allowRefundUsd as boolean
    }

    await this.getSchedules()
  }

  async getSchedules() {
    if (!this.userInfo.isBuyer) return

    const schedules = await this.vestingContract.methods.getSchedules().call()
    let totalPercentage = Zero
    const claimedPercentage = this.userInfo.claimed!.divUnsafe(this.userInfo.amount!).mulUnsafe(fn100)

    this.schedules = (schedules as any).map(s => {
      const { id, date, percentage } = s

      const fnPercentage = FixedNumber.from(Numbers.fromDecimals(percentage, 18))
      const accPercentage = fnPercentage.subUnsafe(totalPercentage)
      const amount = this.userInfo.amount!.mulUnsafe(accPercentage).divUnsafe(fn100)
      const ratio = this.pool?.ratio?.toFixed(10)

      const result = {
        _id: id,
        percentage: accPercentage.toString(),
        amount: amount.toString(),
        ethAmount: amount.mulUnsafe(FixedNumber.from(ratio)).toString(),
        validAfterDate: Numbers.fromSmartContractTimeToMinutes(date),
        wasFinalized: bigNumberHelper.gte(claimedPercentage, fnPercentage),
        refunded: this.userInfo.refunded,
        refundStart: Numbers.fromSmartContractTimeToMinutes(this.refundStart),
        refundEnd: Numbers.fromSmartContractTimeToMinutes(this.refundEnd)
      }
      totalPercentage = totalPercentage.addUnsafe(accPercentage)
      return result
    })
  }

  injectMetamaskWeb3(web3: Web3) {
    if (web3) {
      this.web3 = web3
      this.vestingContract = new web3.eth.Contract(require('./schedule.vesting.abi.json'), this.vestingContractAddress)
    }
  }

  async refund() {
    const f = this.vestingContract.methods.refund()
    await sendRequest(f, walletStore.account)
  }

  async redeemTokens() {
    const f = this.vestingContract.methods.redeemTokens(true)
    return await sendRequest(f, walletStore.account)
  }

  async getUserInfo() {
    const userInfo = await this.vestingContract.methods.userInfos(walletStore.account).call()
    const amount = bigNumberHelper.fromDecimals((userInfo as any).amount, this.pool?.vestingTokenDecimal || 18)
    const claimed = bigNumberHelper.fromDecimals((userInfo as any).claimed, this.pool?.vestingTokenDecimal || 18)
    this.userInfo = {
      amount,
      claimed,
      refunded: (userInfo as any).refuned,
      isBuyer: bigNumberHelper.gt(amount, Zero),
      isClaimed: bigNumberHelper.gt(claimed, Zero)
    }
  }
}
