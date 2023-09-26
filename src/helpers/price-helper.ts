import { FixedNumber } from '@ethersproject/bignumber'
import { FACTORY_ADDRESS, Fetcher, Route, Token, TokenAmount, Trade, TradeType, WETH } from '@pancakeswap-libs/sdk-v2'
import { BUSDToken, CHAIN_ID, provider, web3 } from './bsc-helper'

class PriceHelper {
  lastBnbPrice = '340'

  constructor() {
    // console.log('FACTORY_ADDRESS', FACTORY_ADDRESS)
  }

  async bnb2Usd() {
    const pair = await Fetcher.fetchPairData(BUSDToken, WETH[CHAIN_ID], provider)
    const route = new Route([pair], BUSDToken)
    const value = new TokenAmount(BUSDToken, web3.utils.toWei(`1`))
    const trade = new Trade(route, value, TradeType.EXACT_INPUT)
    return trade.executionPrice.invert().toSignificant(6)
  }

  // async bnb2Token(tokenAddress, decimal) {
  //   const token = new Token(CHAIN_ID, tokenAddress, +decimal)
  //   const pair = await Fetcher.fetchPairData(token, WETH[CHAIN_ID], provider)
  //   const route = new Route([pair], token)
  //   const value = new TokenAmount(token, web3.utils.toWei('1'))
  //   const trade = new Trade(route, value, TradeType.EXACT_INPUT)
  //   const result = trade.executionPrice.invert().toSignificant(12)
  //   return result
  // }

  // async token2Bnb(tokenAddress, decimals, amountx) {
  //   const token = new Token(CHAIN_ID, tokenAddress, decimals)
  //   const pair = await Fetcher.fetchPairData(WETH[CHAIN_ID], token, provider)
  //   const route = new Route([pair], WETH[CHAIN_ID])
  //   const amount = new TokenAmount(WETH[CHAIN_ID], amountx)
  //   const trade = new Trade(route, amount, TradeType.EXACT_INPUT)
  //   return trade.executionPrice.invert().toSignificant(18)
  // }

  async bnb2Token(tokenAddress, decimals, amountx): Promise<{ price: FixedNumber; priceImpact: FixedNumber }> {
    const token = new Token(CHAIN_ID, tokenAddress, decimals)
    const pair = await Fetcher.fetchPairData(token, WETH[CHAIN_ID], provider)
    const route = new Route([pair], token)
    const amount = new TokenAmount(token, amountx)
    const trade = new Trade(route, amount, TradeType.EXACT_INPUT)

    return {
      price: FixedNumber.from(trade.executionPrice.invert().toSignificant(12)),
      priceImpact: FixedNumber.from(trade.priceImpact.toSignificant(12))
    }
  }

  /**
   * Get random number from min -> max
   * @param {*} min INTEGER
   * @param {*} max INTEGER
   * @returns
   */
  getRandomRange(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  getEthBalance(address: string) {
    return web3.eth.getBalance(address).then(x => FixedNumber.from(web3.utils.fromWei(x)))
  }
}

export const priceHelper = new PriceHelper()
