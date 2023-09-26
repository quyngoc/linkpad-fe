import { IReactionDisposer, observable, reaction } from 'mobx'
import { asyncAction } from 'mobx-utils'
import { walletStore } from '@/stores/wallet-store'
import { apiService } from '@/services/api-service'
import { PoolStore } from '../stores/pool-store'
import { FixedPoolModel } from '@/models/fixed-pool-model'
import { Subject } from 'rxjs'
import { reactionWithPrev } from '@/helpers/mobx.helper'
import { promiseHelper } from '@/helpers/promise-helper'

export class AllPoolsViewModel {
  constructor() {
    this.fetchPools()
    this._diposers = [reactionWithPrev(() => this.allPools, this._handlePoolsChanged)]
  }

  _handlePoolsChanged(newPools: PoolStore[], oldPools?: PoolStore[]) {
    oldPools?.forEach(p => p.destroy())
  }

  @observable allPools = [] as any
  @observable totalCount = 0
  @observable loading = false

  private _diposers: IReactionDisposer[] = []
  private _unsubcrible = new Subject();

  @asyncAction *fetchPools(page = 1, searchKey = '') {
    this.loading = true
    try {
      let results = []
      const _start = (page - 1) * 10
      const params = {
        _start,
        _limit: 10,
        _sort: 'index:DESC'
      }

      if (searchKey) {
        results = yield Promise.all([
          apiService.fixedPool.find({ ...params, tokenAddress: searchKey }),
          apiService.fixedPool.count({ tokenAddress: searchKey })
        ])
        if (!results[1]) {
          results = yield Promise.all([
            apiService.fixedPool.find({ ...params, tokenName_contains: searchKey }),
            apiService.fixedPool.count({ tokenName_contains: searchKey })
          ])
          if (!results[1]) {
            results = yield Promise.all([
              apiService.fixedPool.find({ ...params, name_contains: searchKey }),
              apiService.fixedPool.count({ name_contains: searchKey })
            ])
          }
        }
      } else {
        results = yield Promise.all([apiService.fixedPool.find(params), apiService.fixedPool.count({})])
      }

      this.allPools = (results[0] as FixedPoolModel[]).map(p => {
        const ps = new PoolStore(p)
        ps.loadDataIfNeed()
        return ps
      })
      this.totalCount = results[1]
    } finally {
      this.loading = false
    }
  }

  async destroy() {
    this.allPools = []
    await promiseHelper.delay(1)
    this._diposers.forEach(d => d())
  }
}
