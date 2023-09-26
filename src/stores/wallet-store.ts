import { computed, observable } from 'mobx'
import { asyncAction } from 'mobx-utils'
import Application from '@/libs/models'
import Web3 from 'web3'
import { Subscription, timer } from 'rxjs'
import { loadingController } from '@/components/global-loading/global-loading-controller'
import { Zero } from '@/constants'
import { FixedNumber } from '@ethersproject/bignumber'
import { snackController } from '@/components/snack-bar/snack-bar-controller'

const supportedChainId = process.env.VUE_APP_SUPPORTED_CHAIN_ID

export class WalletStore {
  ethereum: any = window.ethereum

  app = new Application({ mainnet: true })
  @observable web3: Web3 | null = null
  @observable account = ''
  @observable bnbBalance = Zero
  @observable chainId = +process.env.VUE_APP_CHAIN_ID!

  @observable loaded = false

  private _bnbBalanceSubscription: Subscription | undefined

  constructor() {
    //
  }

  @asyncAction *start() {
    try {
      this.app.start()
      this.web3 = this.app.web3
      if (yield this.app.getAddress()) {
        yield this.connect()
      }
    } catch (error) {
      console.error(error)
    }
    this.loaded = true
  }

  @asyncAction *connect() {
    loadingController.increaseRequest()
    try {
      const ok = yield this.app.login()
      if (ok) {
        this.web3 = this.app.web3
        this.chainId = yield this.web3!.eth.getChainId()
        this.account = yield this.app.getAddress()
        this.ethereum.removeListener('accountsChanged', this.ethereumConfigChanged)
        this.ethereum.removeListener('chainChanged', this.ethereumConfigChanged)
        this.ethereum.once('accountsChanged', this.ethereumConfigChanged)
        this.ethereum.once('chainChanged', this.ethereumConfigChanged)
        this._bnbBalanceSubscription?.unsubscribe()
        this._bnbBalanceSubscription = timer(0, 5000).subscribe(() => {
          this.getBnbBalance()
        })
      }
      return ok
    } catch (error) {
      error.message && snackController.error(error.message)
      return false
    } finally {
      loadingController.decreaseRequest()
    }
  }

  ethereumConfigChanged = () => {
    window.location.reload()
  }

  async switchNetwork(chainId: number) {
    if (this.connected) {
      try {
        await this.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: Web3.utils.toHex(chainId) }]
        })
      } catch (error) {
        if (error.message.includes('wallet_addEthereumChain')) {
          if (chainId === 56) {
            this.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: Web3.utils.toHex(chainId),
                  chainName: 'Binance Smart Chain Mainnet',
                  nativeCurrency: {
                    name: 'Binance Chain Native Token',
                    symbol: 'BNB',
                    decimals: 18
                  },
                  rpcUrls: [
                    'https://bsc-dataseed.binance.org',
                    'https://bsc-dataseed1.binance.org',
                    'https://bsc-dataseed2.binance.org',
                    'https://bsc-dataseed3.binance.org',
                    'https://bsc-dataseed4.binance.org',
                    'https://bsc-dataseed1.defibit.io',
                    'https://bsc-dataseed2.defibit.io',
                    'https://bsc-dataseed3.defibit.io',
                    'https://bsc-dataseed4.defibit.io',
                    'https://bsc-dataseed1.ninicoin.io',
                    'https://bsc-dataseed2.ninicoin.io',
                    'https://bsc-dataseed3.ninicoin.io',
                    'https://bsc-dataseed4.ninicoin.io',
                    'https://bsc.rpc.blxrbdn.com',
                    'https://bsc.publicnode.com',
                    'wss://bsc-ws-node.nariox.org'
                  ],
                  blockExplorerUrls: ['https://bscscan.com']
                }
              ]
            })
          } else if (chainId === 97) {
            this.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: Web3.utils.toHex(chainId),
                  chainName: 'Binance Smart Chain Testnet',
                  nativeCurrency: {
                    name: 'Binance Chain Native Token',
                    symbol: 'tBNB',
                    decimals: 18
                  },
                  rpcUrls: [
                    'https://data-seed-prebsc-1-s1.binance.org:8545',
                    'https://data-seed-prebsc-2-s1.binance.org:8545',
                    'https://data-seed-prebsc-1-s2.binance.org:8545',
                    'https://data-seed-prebsc-2-s2.binance.org:8545',
                    'https://data-seed-prebsc-1-s3.binance.org:8545',
                    'https://data-seed-prebsc-2-s3.binance.org:8545'
                  ],
                  blockExplorerUrls: ['https://testnet.bscscan.com']
                }
              ]
            })
          }
        }
      }
    }
  }

  @asyncAction *getBnbBalance() {
    const result = yield this.web3?.eth.getBalance(this.account)
    this.bnbBalance = FixedNumber.from(this.web3?.utils.fromWei(result, 'ether'))
  }

  //#region computed
  @computed get connected() {
    return !!this.account
  }

  @computed get hasEthereumPlugin() {
    return !!this.ethereum
  }

  @computed get shortAccount() {
    if (!this.account) return ''
    return this.account.substr(0, 3) + '...' + this.account.substr(this.account.length - 3)
  }

  @computed get chainIdValid() {
    return !supportedChainId || !this.chainId || this.chainId + '' === supportedChainId.toString()
  }

  @computed get bnbAddress() {
    return this.chainId === 97
      ? '0xcaa95833d9e5a16883ae3a21643ebcd5ffeae31b'
      : '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
  }
  //#endregion
}

export const walletStore = new WalletStore()
