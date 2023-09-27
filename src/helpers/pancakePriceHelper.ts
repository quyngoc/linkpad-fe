import { FixedNumber } from '@ethersproject/bignumber'
import { ChainId, Token, Fetcher, Route, Trade, TokenAmount, TradeType, Pair } from '@overage69/pancake-sdk-v2'
import { getDefaultProvider } from '@ethersproject/providers'
import Web3 from 'web3'
const provider = getDefaultProvider('https://bsc-dataseed.binance.org/')
const web3 = new Web3('https://bsc-dataseed.binance.org/')
const addresses = {
  WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
}
const [WBNB, BUSD] = [addresses.WBNB, addresses.BUSD].map(tokenAddress => new Token(ChainId.MAINNET, tokenAddress, 18))
const TOKEN_ADDRESS = '0x1c796C140de269E255372ea687EF7644BAb87935'

export class PancakePriceHelper {
  tokenPriceBUSD?: any

  async getTokenPrice() {
    const token = this.createNewBep20Token(TOKEN_ADDRESS, 18)
    this.tokenPriceBUSD = await this.getBep20TokenPriceBUSD(token)
  }

  createNewBep20Token(tokenAddress, tokenDecimals) {
    return new Token(ChainId.MAINNET, tokenAddress, tokenDecimals)
  }

  async getBep20TokenPriceBUSD(token) {
    const pair = await Fetcher.fetchPairData(token, BUSD, provider)
    const route = new Route([pair], token)
    const amount = new TokenAmount(token, web3.utils.toBN(Math.pow(10, token.decimals)) as any)
    const trade = new Trade(route, amount, TradeType.EXACT_INPUT)
    return trade.executionPrice.toSignificant(18)
  }
}
export const pancakePriceHelper = new PancakePriceHelper()
