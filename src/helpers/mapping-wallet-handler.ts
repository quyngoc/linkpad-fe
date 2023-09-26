/* eslint-disable prettier/prettier */
import { blockchainHandler } from '@/blockchain'
import Web3 from 'web3'

//TODO: Change to mainnet
const web3 = blockchainHandler.getWeb3(56)!

async function sendRequest(fx, from) {
  return await new Promise((resolve, reject) => {
    fx.send({ from })
      .on('receipt', result => resolve(result))
      .on('error', error => reject(error))
  })
}

export class MappingWalletHandler {
  mappingWalletContract: any

  constructor() {
    this.mappingWalletContract = new web3.eth.Contract(
      require('./mapping-wallet.abi.json'),
      process.env.VUE_APP_MAPPING_WALLET_ADDRESS
    )
  }

  injectMetamask(web3: Web3) {
    if (web3) {
      this.mappingWalletContract = new web3.eth.Contract(
        require('./mapping-wallet.abi.json'),
        process.env.VUE_APP_MAPPING_WALLET_ADDRESS
      )
    }
  }

  async getSolanaAddress(account) {
    const results = await this.mappingWalletContract.methods.getSolanaAddresses([account]).call()
    return results[0]
  }

  async setSolanaAddress(address, account) {
    const f = this.mappingWalletContract.methods.setAddress(address)
    await sendRequest(f, account)
  }
}

export const mappingWalletHandler = new MappingWalletHandler()
