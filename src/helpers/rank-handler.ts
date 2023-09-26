/* eslint-disable prettier/prettier */
import { walletStore } from '@/stores/wallet-store'
import { blockchainHandler } from '@/blockchain'

async function sendRequest(fx, from) {
  return await new Promise((resolve, reject) => {
    fx.send({ from })
      .on('receipt', () => resolve(''))
      .on('error', error => reject(error))
  })
}

const bscMainWeb3 = blockchainHandler.getWeb3(process.env.VUE_APP_CHAIN_ID)!

const rankContract = new bscMainWeb3.eth.Contract(require('./rank.abi.json'), process.env.VUE_APP_RANK_ADDRESS)

export const rankHandler = {
  getUserRank: async () => {
    try {
      const rank = await rankContract.methods.userRanks(walletStore.account).call()
      return rank
    } catch (error) {
      console.error(error)
      return '0'
    }
  }
}
