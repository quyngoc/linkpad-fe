/* eslint-disable prettier/prettier */
import { FixedNumber } from '@ethersproject/bignumber'
import { walletStore } from '@/stores/wallet-store'
import moment from 'moment'
import Web3 from 'web3'
import { WBNBContract } from './bsc-helper'
import { priceHelper } from './price-helper'
import { blockchainHandler } from '@/blockchain'
import { promiseHelper } from './promise-helper'

const BSC_BLOCK_TIME = 3
const BLOCKS_PER_YEAR = FixedNumber.from(`${(60 / BSC_BLOCK_TIME) * 60 * 24 * 365}`) // 10512000

async function sendRequest(fx, from) {
  return await new Promise((resolve, reject) => {
    fx.send({ from })
      .on('receipt', () => resolve(''))
      .on('error', error => reject(error))
  })
}

const mainWeb3 = blockchainHandler.getWeb3(process.env.VUE_APP_FARM_CHAIN_ID)!

export class FarmHandler {
  farmContract: any
  LPTokenContract: any
  tokenContract: any
  lockDuration?: moment.Duration

  rewardToken?: string
  poolToken?: string

  constructor() {
    this.farmContract = new mainWeb3.eth.Contract(require('./farm.abi.v2.json'), process.env.VUE_APP_FARM_ADDRESS)
  }

  async load() {
    const rewardToken = await this.farmContract.methods.rewardToken().call()
    this.rewardToken = Web3.utils.toChecksumAddress(rewardToken)
    const {
      0: poolToken,
      1: allocPoint,
      2: lastRewardBlock,
      3: accRewardPerShare,
      4: lockDuration
    } = await this.farmContract.methods.poolInfo(0).call()
    this.poolToken = Web3.utils.toChecksumAddress(poolToken)
    this.lockDuration = moment.duration(lockDuration, 'seconds')

    this.tokenContract = new mainWeb3.eth.Contract(require('./erc20.abi.json'), this.rewardToken)
    this.LPTokenContract = new mainWeb3.eth.Contract(require('./erc20.abi.json'), this.poolToken)
  }

  injectMetamask(web3: Web3) {
    if (web3) {
      this.farmContract = new web3.eth.Contract(require('./farm.abi.v2.json'), process.env.VUE_APP_FARM_ADDRESS)
      this.tokenContract = new web3.eth.Contract(require('./erc20.abi.json'), this.rewardToken)
      this.LPTokenContract = new web3.eth.Contract(require('./erc20.abi.json'), this.poolToken)
    }
  }

  async approved(account, index = 3) {
    try {
      const allowance = await this.LPTokenContract.methods.allowance(account, process.env.VUE_APP_FARM_ADDRESS).call()
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
    const f = this.LPTokenContract.methods.approve(process.env.VUE_APP_FARM_ADDRESS, Web3.utils.toWei(`${2 ** 32 - 1}`))
    await sendRequest(f, account)
  }
  async stakeLP(account, amount) {
    const f = this.farmContract.methods.stakeLP(0, Web3.utils.toWei(`${amount.toString()}`))
    await sendRequest(f, account)
  }
  async unstakeLP(account, amount) {
    const f = this.farmContract.methods.unstakeLP(0, Web3.utils.toWei(`${amount.toString()}`))
    await sendRequest(f, account)
  }

  async getUserInfo(account) {
    const arrs: any[] = await blockchainHandler.etherBatchRequest(mainWeb3, [
      this.farmContract.methods.getUserInfo(0, account),
      this.farmContract.methods.getRewardAmount(0, account),
      this.LPTokenContract.methods.balanceOf(account)
    ])

    const { 0: amount, 1: lastStakeTime } = arrs[0]
    const rewardAmount = FixedNumber.from(`${Web3.utils.fromWei(arrs[1])}`)
    const userLPBalance = FixedNumber.from(`${Web3.utils.fromWei(arrs[2])}`)

    return {
      amount: FixedNumber.from(`${Web3.utils.fromWei(amount)}`),
      lastStakeTime: +lastStakeTime ? moment(+lastStakeTime * 1000) : null,
      rewardAmount,
      userLPBalance
    }
  }

  async harvest(account) {
    const f = this.farmContract.methods.harvest(0)
    await sendRequest(f, account)
  }
  async getFarmLiquidityAndApy() {
    // const bnb2UsdPrice = FixedNumber.from(await priceHelper.bnb2Usd())
    // const bnbBalanceLP = await WBNBContract.methods
    //   .balanceOf(this.poolToken)
    //   .call()
    //   .then(x => FixedNumber.from(`${Web3.utils.fromWei(x)}`))
    // const tokenBalanceLP = await this.tokenContract.methods
    //   .balanceOf(this.poolToken)
    //   .call()
    //   .then(x => FixedNumber.from(`${Web3.utils.fromWei(x)}`))
    // const totalSupplyLP: FixedNumber = await this.LPTokenContract.methods
    //   .totalSupply()
    //   .call()
    //   .then(x => FixedNumber.from(`${Web3.utils.fromWei(x)}`))
    // const tokenPerBlock = await this.farmContract.methods
    //   .tokenPerBlock()
    //   .call()
    //   .then(x => FixedNumber.from(`${Web3.utils.fromWei(x)}`))
    // const poolInfo = await this.farmContract.methods.poolInfo(0).call()
    // const farmLPBalance = FixedNumber.from(`${Web3.utils.fromWei(poolInfo[5])}`)
    // const totalLPInUsd: FixedNumber = bnbBalanceLP
    //   .mulUnsafe(FixedNumber.from('2')) // total = x2 bnb
    //   .mulUnsafe(bnb2UsdPrice) // convert to usd
    // const lp2UsdPrice = totalLPInUsd.divUnsafe(totalSupplyLP)
    // const poolLiquidityUsd = farmLPBalance.mulUnsafe(lp2UsdPrice) // => bnb in contract
    // const token2BnbPrice = bnbBalanceLP.divUnsafe(tokenBalanceLP)
    // const token2UsdPrice = token2BnbPrice.mulUnsafe(bnb2UsdPrice)
    // const apy = poolLiquidityUsd.isZero()
    //   ? FixedNumber.from('0')
    //   : tokenPerBlock
    //       .mulUnsafe(BLOCKS_PER_YEAR)
    //       .mulUnsafe(token2UsdPrice)
    //       .divUnsafe(poolLiquidityUsd)
    //       .mulUnsafe(FixedNumber.from('100'))
    // return { poolLiquidityUsd, apy, lp2UsdPrice, token2UsdPrice }
  }
}

const farmContract = new mainWeb3.eth.Contract(require('./farm.abi.json'), process.env.VUE_APP_FARM_ADDRESS)

export const farmHandler = {
  getStakedAmount: async () => {
    try {
      const res = await farmContract.methods.userInfo(1, walletStore.account).call()
      return FixedNumber.from(mainWeb3.utils.fromWei(res[0]))
    } catch (error) {
      console.error(error)
      return FixedNumber.from('0')
    }
  },
  getLPLocked: async () => {
    try {
      const res = await farmContract.methods.userInfo(0, walletStore.account).call()
      return FixedNumber.from(mainWeb3.utils.fromWei(res[0]))
    } catch (error) {
      console.error(error)
      return FixedNumber.from('0')
    }
  }
}
