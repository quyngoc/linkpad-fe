import { Token } from '@pancakeswap-libs/sdk-v2'
import { getDefaultProvider } from '@ethersproject/providers'
import Web3 from 'web3'

export const PROVIDER = 'https://bsc-dataseed.binance.org/'
export const FACTORY = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
export const ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
export const BUSD = Web3.utils.toChecksumAddress('0xe9e7cea3dedca5984780bafc599bd69add087d56')
export const WBNB = Web3.utils.toChecksumAddress('0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c')
export const CHAIN_ID = 56

export const BUSDToken = new Token(CHAIN_ID, BUSD, 18)
export const provider = getDefaultProvider(PROVIDER) as any
export const web3 = new Web3(PROVIDER)

export const BUSDContract = new web3.eth.Contract(require('./erc20.abi.json'), BUSD)
export const WBNBContract = new web3.eth.Contract(require('./erc20.abi.json'), WBNB)
