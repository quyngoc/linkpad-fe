import { snackController } from '@/components/snack-bar/snack-bar-controller'
import { mappingWalletHandler } from '@/helpers/mapping-wallet-handler'
import { walletStore } from '@/stores/wallet-store'
import { PublicKey } from '@solana/web3.js'
import { action, IReactionDisposer, observable, reaction } from 'mobx'
import { asyncAction } from 'mobx-utils'

export class SettingSolanaWalletViewModel {
  CHAIN_ID = +process.env.VUE_APP_CHAIN_ID!
  _disposers: IReactionDisposer[] = []
  @observable approved = false
  @observable approving = false
  @observable solanaAddress = ''
  @observable isUpdate = false
  @observable showConfirm = false
  @observable isSetting = false

  constructor() {
    this.loadData()
    this._disposers = [
      reaction(
        () => walletStore.account,
        () => {
          if (walletStore.chainId === this.CHAIN_ID) {
            mappingWalletHandler.injectMetamask(walletStore.web3!)
            this.loadData()
          }
        }
      )
    ]
  }

  @asyncAction *loadData() {
    if (walletStore.account && walletStore.chainId === this.CHAIN_ID) {
      mappingWalletHandler.injectMetamask(walletStore.web3!)
      this.solanaAddress = yield mappingWalletHandler.getSolanaAddress(walletStore.account)
    }
  }

  @asyncAction *setSolanaAddress(solanaAddress) {
    this.isSetting = true
    try {
      yield mappingWalletHandler.setSolanaAddress(solanaAddress, walletStore.account)
      this.solanaAddress = yield mappingWalletHandler.getSolanaAddress(walletStore.account)
      this.changeWallet(false)
    } catch (error) {
      snackController.error(error.message)
    } finally {
      this.isSetting = false
    }
  }

  @action.bound changeWallet(isUpdate) {
    this.isUpdate = isUpdate
  }

  @action.bound cancelConfirm() {
    this.showConfirm = false
  }

  @action.bound submit(address) {
    try {
      new PublicKey(address)
    } catch (error) {
      snackController.error('This is not valid address')
      return
    }

    this.showConfirm = true
  }
}
