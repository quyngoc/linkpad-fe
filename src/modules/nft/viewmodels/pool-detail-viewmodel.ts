import { snackController } from '@/components/snack-bar/snack-bar-controller'
import { Zero } from '@/constants'
import { bigNumberHelper } from '@/helpers/bignumber-helper'
import { nftMarketHandler } from '@/helpers/nft-market-handler'
import { numberHelper } from '@/helpers/number.hepler'
import { walletStore } from '@/stores/wallet-store'
import { FixedNumber } from '@ethersproject/bignumber'
import { action, computed, IReactionDisposer, observable, reaction, runInAction, when } from 'mobx'
import { asyncAction } from 'mobx-utils'
import moment from 'moment'
import { Subject, timer } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { POOL_DATA } from '../pool-data'
import { appProvider } from '@/app-providers'

export class PoolDetailViewModel {
  // TODO: change to mainet
  CHAIN_ID = +process.env.VUE_APP_CHAIN_ID!
  _disposers: IReactionDisposer[] = []
  private _unsubcrible = new Subject()

  @observable approved = true
  @observable approving = false
  @observable buying = false
  @observable showBuyBoxDialog = false
  @observable selectedItemId = null
  @observable itemConfigLoading = false
  @observable inputNumber = '0'
  @observable userLPBalance = FixedNumber.from('0')
  @observable itemTradeSymbol = ''
  poolId = ''

  constructor() {
    const currentPool = POOL_DATA.find(pool => pool.key === appProvider.router.currentRoute.params.name)
    if (currentPool && currentPool.id) {
      this.poolId = currentPool.id
    } else {
      appProvider.router.replace('/b-nft')
      return
    }

    this.loadData()
    this._disposers = [
      reaction(
        () => walletStore.account,
        () => {
          if (walletStore.chainId === this.CHAIN_ID) {
            nftMarketHandler?.injectMetamask(walletStore.web3!)
          }
        }
      )
    ]
  }

  destroy() {
    this._unsubcrible.next()
    this._unsubcrible.complete()
    this._disposers.forEach(d => d())
  }
  @observable poolData
  @observable poolStatus = '';

  @asyncAction *loadData() {
    yield this.loadPool()
    const currentTime = Number(moment().format('X'))

    if (this.poolData && this.poolData.startDate <= currentTime && this.poolData.endDate > currentTime) {
      this.poolStatus = 'onSale'
    } else if (this.poolData && this.poolData.startDate > currentTime) {
      this.poolStatus = 'upcoming'
    } else if (this.poolData && this.poolData.endDate <= currentTime) {
      this.poolStatus = 'ended'
    }
    this._disposers.push(
      when(
        () => walletStore.connected,
        async () => {
          if (walletStore.chainId === this.CHAIN_ID) {
            nftMarketHandler.injectMetamask(walletStore.web3!)

            timer(0, 10000)
              .pipe(takeUntil(this._unsubcrible))
              .subscribe(async () => {
                this.loadPool()
              })
          }
        }
      )
    )
  }

  @asyncAction *loadPool() {
    const contractPool = yield nftMarketHandler.loadPool(this.poolId)
    const localPool = POOL_DATA.find(item => item.id === this.poolId)
    const isValidConnect = walletStore.account && walletStore.chainId === this.CHAIN_ID
    if (contractPool && contractPool.itemConfigs && contractPool.itemConfigs.length) {
      let itemBoughtNfts: any = []
      if (isValidConnect) {
        itemBoughtNfts = yield Promise.all(
          contractPool.itemConfigs.map(item => nftMarketHandler.getUserInfo(walletStore.account, this.poolId, item.id))
        )
      }

      const items = contractPool.itemConfigs.map(itemConfig => {
        const item = (localPool?.items as any[]).find(i => i.id === +itemConfig.id)
        return {
          ...item,
          ...itemConfig,
          purchased: isValidConnect
            ? itemBoughtNfts.find(i => i.poolId === this.poolId && i.itemId === itemConfig.id).boughtNft
            : 0
        }
      })
      this.poolData = {
        ...localPool,
        ...contractPool,
        items
      }
    } else {
      this.poolData = {
        ...localPool
      }
    }
  }

  @asyncAction *approve() {
    this.approving = true
    try {
      yield nftMarketHandler.approve(
        walletStore.web3!,
        walletStore.account,
        this.poolData.items![this.selectedItemId!].tradeTokenAddress
      )
      this.approved = true
    } catch (error) {
      snackController.error(error.message)
    }
    this.approving = false
  }

  @asyncAction *openBuyBoxDialog(itemId) {
    this.itemConfigLoading = true

    this.showBuyBoxDialog = true
    this.selectedItemId = itemId
    this.itemTradeSymbol = this.poolData.items![itemId].tradeTokenSymbol

    // yield nftMarketHandler
    //   ?.approved(walletStore.web3!, walletStore.account, this.poolData.items![itemId].tradeTokenAddress)
    //   .then(approved => runInAction(() => (this.approved = approved)))
    this.userLPBalance = yield nftMarketHandler?.getUserLPBalance(walletStore.account)
    this.itemConfigLoading = false
  }

  @action closeBuyBoxDialog() {
    this.showBuyBoxDialog = false
    this.selectedItemId = null
    this.inputNumber = '0'
  }

  @action.bound changeInputNumber(num) {
    if (numberHelper.isNumber(num)) this.inputNumber = num.toString()
    else this.inputNumber = '0'
  }

  @asyncAction *buyBox() {
    if (bigNumberHelper.gt(this.itemTotalPay, this.userLPBalance)) {
      snackController.error(`Balance is Insufficient`)
      return
    }
    if (+this.inputNumber > this.itemBoxLeft) {
      snackController.error(`Buy amount must be less than Box left`)
      return
    }

    try {
      this.buying = true
      yield nftMarketHandler?.buy(
        walletStore.account,
        +this.poolData.id,
        +this.selectedItemId!,
        +this.inputNumber,
        this.itemUnitPrice,
        this.poolData.items![this.selectedItemId!].tradeDecimals
      )
      snackController.success(
        `Buy successfully ${this.inputNumber} ${+this.inputNumber > 1 ? 'boxes' : 'box'}. Thank you for participation!`
      )
      this.showBuyBoxDialog = false
    } catch (error) {
      snackController.error(error.message)
      console.error(error)
    } finally {
      this.buying = false
    }
  }

  @computed get isValidNumberInput() {
    if (
      !this.inputNumber ||
      FixedNumber.from(this.inputNumber).isNegative() ||
      FixedNumber.from(this.inputNumber).isZero()
    )
      return false
    return true
  }

  @computed get itemNftForSale() {
    if (this.selectedItemId !== null) return this.poolData.items![this.selectedItemId!].nftForSale
    else return '0'
  }
  @computed get itemBoughtNft() {
    if (this.selectedItemId !== null) return this.poolData.items![this.selectedItemId!].boughtNft
    else return '0'
  }
  @computed get itemBoxLeft() {
    return +this.itemNftForSale - +this.itemBoughtNft
  }

  @computed get itemUnitPrice() {
    if (this.selectedItemId !== null) return FixedNumber.from(this.poolData.items[this.selectedItemId!].price + '')
    else return Zero
  }

  @computed get itemSoldOut() {
    if (this.selectedItemId !== null) return this.poolData.items[this.selectedItemId!].soldOut
    else return false
  }

  @computed get itemAllocationLeft() {
    return this.itemUnitPrice.mulUnsafe(FixedNumber.from(this.itemBoxLeft + ''))
  }

  @computed get itemTotalPay() {
    if (+this.inputNumber === 0) return Zero
    else return this.itemUnitPrice.mulUnsafe(FixedNumber.from(this.inputNumber))
  }
}
