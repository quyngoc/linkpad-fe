import { nftMarketHandler } from '@/helpers/nft-market-handler'
import { walletStore } from '@/stores/wallet-store'
import { computed, observable, action, IReactionDisposer, reaction, when } from 'mobx'
import { asyncAction } from 'mobx-utils'
import moment from 'moment'
import { Subject } from 'rxjs'
import { POOL_DATA } from '../pool-data'

export class PoolViewModel {
  _disposers: IReactionDisposer[] = []
  private _unsubcrible = new Subject()
  @observable featurePools
  @observable upcomingPools
  @observable endedPools
  @observable onSalePools

  constructor() {
    this.loadPools()
    this.upcomingPools = [...POOL_DATA.filter(pool => pool.isUpcoming && moment(pool.startDate, 'X').isAfter(moment()))]
  }

  destroy() {
    this._unsubcrible.next()
    this._unsubcrible.complete()
    this._disposers.forEach(d => d())
  }

  @asyncAction *loadPools() {
    this.featurePools = [...POOL_DATA.filter(pool => moment(pool.endDate, 'X').isAfter(moment()))]
    this.onSalePools = this.featurePools.filter(pool =>
      moment().isBetween(moment(pool.startDate, 'X'), moment(pool.endDate, 'X'))
    )
    this.upcomingPools = [...POOL_DATA.filter(pool => pool.isUpcoming && moment(pool.startDate, 'X').isAfter(moment()))]
    this.endedPools = [...POOL_DATA.filter(pool => moment().isAfter(moment(pool.endDate, 'X')))]

    yield nftMarketHandler.loadAllPools()
    this.featurePools = this.featurePools.map(pool => {
      const itemConfigs = nftMarketHandler.pools[pool.id].itemConfigs
      const totalBoughtNft = itemConfigs.reduce((prev, cur) => prev + +cur.boughtNft, 0)

      return { ...pool, totalBoughtNft, itemConfigs }
    })
  }
}
