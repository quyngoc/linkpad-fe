/* eslint-disable prettier/prettier */
import { FixedNumber } from '@ethersproject/bignumber'
import { blockchainHandler } from '@/blockchain'
import Web3 from 'web3'
import { bigNumberHelper } from './bignumber-helper'
import { POOL_DATA } from '@/modules/nft/pool-data'
import { chunk, isNumber } from 'lodash-es'
import { walletStore } from '@/stores/wallet-store'

//TODO: Change to mainnet
const web3 = blockchainHandler.getWeb3(56)!

async function sendRequest(fx, from, value = '') {
  return await new Promise((resolve, reject) => {
    fx.send({ from, value })
      .on('receipt', result => resolve(result))
      .on('error', error => reject(error))
  })
}

class NftMarketHandler {
  pools: {
    [id: string]: {
      startDate: Date
      endDate: Date
      itemConfigs: [
        {
          id: string
          nftForSale: string
          maxUserNft: string
          boughtNft: string
          price: string
          tradeToken: string
          tradeDecimals: string
          tradeAmount: string
          withdrawnAmount: string
        }
      ]
    }
  } = {}
  web3: any

  nftMarketContract: any
  LPTokenContract: any
  tradeTokenAddress?: string
  boughtNftItems: Array<string> = []
  nftForSaleItems: Array<string> = []
  itemConfigs?: Array<{
    id
    nftForSale
    maxUserNft
    boughtNft
    price
    tradeToken
    tradeDecimals
    tradeAmount
    withdrawnAmount
  }>

  constructor() {
    this.nftMarketContract = new web3.eth.Contract(
      require('./nft-market.abi.json'),
      process.env.VUE_APP_NFT_MARKET_ADDRESS
    )
  }

  async loadAllPools() {
    const methods = this.nftMarketContract.methods
    const group = chunk(POOL_DATA, 10)
    const contractPoolInfors: any[] = []
    for (const poolChunks of group) {
      const poolInfors: any[] = await blockchainHandler.etherBatchRequest(
        web3,
        poolChunks.map(pool => methods.getItemConfigs(pool.id))
      )
      contractPoolInfors.push(...poolInfors)
    }

    this.pools = POOL_DATA.reduce((prev, cur, index) => {
      return {
        ...prev,
        [cur.id]: {
          itemConfigs: contractPoolInfors[index].map(item => {
            const forceProgressPercent = cur.items[item.id]?.forceProgressPercent
            const baseProgressPercent = cur.items[item.id]?.baseProgressPercent

            let boughtNft = +item.boughtNft
            if (isNumber(forceProgressPercent) && forceProgressPercent > 0) {
              boughtNft = Math.round((item.nftForSale * forceProgressPercent) / 100)
            } else if (isNumber(baseProgressPercent) && baseProgressPercent > 0) {
              boughtNft += Math.round((item.nftForSale * baseProgressPercent) / 100)
              if (boughtNft >= +item.nftForSale) boughtNft = +item.nftForSale
            }

            return {
              id: item.id,
              nftForSale: item.nftForSale,
              maxUserNft: item.maxUserNft,
              boughtNft: boughtNft.toString(),
              price: web3.utils.fromWei(item.price),
              tradeTokenAddress: item.tradeToken,
              tradeDecimals: item.tradeDecimals,
              tradeAmount: web3.utils.fromWei(item.tradeAmount),
              withdrawnAmount: item.withdrawnAmount,
              progress: (+boughtNft * 100) / +item.nftForSale,
              soldOut: +boughtNft === +item.nftForSale
            }
          })
        }
      }
    }, {})
  }

  async loadPool(poolId) {
    const methods = this.nftMarketContract.methods
    // const poolConfig = await methods.poolConfigs(poolId).call()
    const itemConfigs = await methods.getItemConfigs(poolId).call()
    return {
      //   startDate: poolConfig.startDate,
      //   endDate: poolConfig.endDate,
      itemConfigs: itemConfigs.map(item => {
        const forceProgressPercent = POOL_DATA.find(p => p.id === poolId)?.items[item.id]?.forceProgressPercent
        const baseProgressPercent = POOL_DATA.find(p => p.id === poolId)?.items[item.id]?.baseProgressPercent

        let boughtNft = +item.boughtNft
        if (isNumber(forceProgressPercent) && forceProgressPercent > 0) {
          boughtNft = Math.round((item.nftForSale * forceProgressPercent) / 100)
        } else if (isNumber(baseProgressPercent) && baseProgressPercent > 0) {
          boughtNft += Math.round((item.nftForSale * baseProgressPercent) / 100)
          if (boughtNft >= +item.nftForSale) boughtNft = +item.nftForSale
        }

        return {
          id: item.id,
          nftForSale: item.nftForSale,
          maxUserNft: item.maxUserNft,
          boughtNft: boughtNft.toString(),
          price: web3.utils.fromWei(item.price),
          tradeTokenAddress: item.tradeToken,
          tradeDecimals: item.tradeDecimals,
          tradeAmount: web3.utils.fromWei(item.tradeAmount),
          withdrawnAmount: item.withdrawnAmount,
          progress: (+boughtNft * 100) / +item.nftForSale,
          soldOut: +boughtNft === +item.nftForSale
        }
      })
    }
  }

  injectMetamask(web3: Web3) {
    if (web3) {
      this.web3 = web3
      this.nftMarketContract = new web3.eth.Contract(
        require('./nft-market.abi.json'),
        process.env.VUE_APP_NFT_MARKET_ADDRESS
      )
    }
  }

  async approved(web3, account, tradeTokenAddress) {
    try {
      this.LPTokenContract = new web3.eth.Contract(require('./erc20.abi.json'), tradeTokenAddress)
      const allowance = await this.LPTokenContract.methods
        .allowance(account, process.env.VUE_APP_NFT_MARKET_ADDRESS)
        .call()
      return !!+web3.utils.fromWei(allowance)
    } catch (error) {
      console.error(error)
      return false
    }
  }
  async approve(web3, account, tradeTokenAddress) {
    this.LPTokenContract = new web3.eth.Contract(require('./erc20.abi.json'), tradeTokenAddress)
    const f = this.LPTokenContract.methods.approve(
      process.env.VUE_APP_NFT_MARKET_ADDRESS,
      web3.utils.toWei(`${2 ** 32 - 1}`)
    )
    await sendRequest(f, account)
  }

  async getUserLPBalance(account) {
    // const allowance = await this.LPTokenContract.methods.balanceOf(account).call()
    // return FixedNumber.from(`${web3.utils.fromWei(allowance)}`)
    return walletStore.bnbBalance
  }

  async buy(
    account: string,
    poolId: number,
    itemId: number,
    nftAmount: number,
    price: FixedNumber | string,
    tradeDecimals: number | string
  ) {
    const f = this.nftMarketContract.methods.buy(
      poolId,
      itemId,
      nftAmount,
      bigNumberHelper.toDecimalString(price, +tradeDecimals)
    )
    await sendRequest(f, account, bigNumberHelper.toDecimalString(price))
  }

  async getUserInfo(account, poolId, itemId) {
    const { boughtNft } = await this.nftMarketContract.methods.userInfos(account, poolId, itemId).call()
    return { poolId, itemId, boughtNft }
  }
}

export const nftMarketHandler = new NftMarketHandler()
