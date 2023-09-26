import { FixedPoolModel } from '@/models/fixed-pool-model'
import { apiService } from '@/services/api-service'
import { mapKeys } from 'lodash'
import { computed, observable } from 'mobx'
import { asyncAction } from 'mobx-utils'
import { reactionWithPrev } from '@/helpers/mobx.helper'
import { PoolStore } from './pool-store'
import { sortBy } from 'lodash-es'

export class PoolsStore {
  @observable idoPools: PoolStore[] = []
  @observable investPools: PoolStore[] = []

  constructor() {
    reactionWithPrev(() => this.idoPools, this._handlePoolsChanged)
    reactionWithPrev(() => this.investPools, this._handlePoolsChanged)
  }

  //#region ACTIONS
  @asyncAction *fetchPools(type: 'ido' | 'invest') {
    const pools: FixedPoolModel[] = yield apiService.fixedPool.find({ _sort: 'index:DESC', categoryPool: type })
    if (type === 'ido') {
      this.idoPools = pools.map(p => {
        const pool = this.poolsMap[p.id!]
        pool?.changeModel(p)
        return pool || new PoolStore(p)
      })
    } else if (type === 'invest') {
      this.investPools = pools.map(p => {
        const pool = this.poolsMap[p.id!]
        pool?.changeModel(p)
        return pool || new PoolStore(p)
      })
    }
  }
  @asyncAction *getPool(slugName: string) {
    const pools: FixedPoolModel[] = yield apiService.fixedPool.find({ slugName }, { _limit: 1 })
    const pool = pools && pools[0]
    if (pool) {
      let poolStore = this.poolsMap[pool.id!]
      if (poolStore && !pool.vestingAddress) {
        poolStore.changeModel(pool)
      } else {
        poolStore = new PoolStore(pool)
        if (poolStore.contract) {
          yield poolStore.contract.assertERC20Info()
        }
        if (pool.categoryPool === 'ido') {
          this.idoPools.push(poolStore)
        } else {
          this.investPools.push(poolStore)
        }
      }
      return poolStore
    }
    return null
  }
  //#endregion

  //#region EFFECTS
  private _handlePoolsChanged(newPools: PoolStore[], oldPools?: PoolStore[]) {
    oldPools = oldPools || []
    const removedPeers = oldPools.filter(p => !newPools.find(x => x.pool.id === p.pool.id))
    removedPeers.forEach(p => p.destroy())
  }
  //#endregion

  //#region COMPUTEDS
  @computed get poolsMap(): { [id: string]: PoolStore } {
    return mapKeys(this.validPools, p => p.pool.id)
  }
  @computed get allPools() {
    return [...this.idoPools, ...this.investPools]
  }
  @computed get validPools() {
    const valids = this.allPools
    return sortBy(valids, x => -(x.pool.index || 0))
  }

  @computed get exclusivePools() {
    return this.idoPools.filter(p => p.pool.data?.isExclusive && !p.poolState?.ended)
  }
  //#endregion
}

export const poolsStore = new PoolsStore()
