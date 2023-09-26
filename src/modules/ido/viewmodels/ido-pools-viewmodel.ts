import { appProvider } from '@/app-providers'
import { action, computed, observable } from 'mobx'
import moment from 'moment'
import { poolsStore } from '../stores/pools-store'
export class IdoPoolsViewModel {
  @observable ido = true
  @observable currentPage = 1
  @observable itemsPerPage = 12

  constructor() {
    //
  }

  loadData() {
    this.ido = appProvider.router.currentRoute.path !== '/invest'
    poolsStore.fetchPools(this.ido ? 'ido' : 'invest')
  }

  @action.bound changePage(page) {
    this.currentPage = page
  }

  @computed get filteredPools() {
    return poolsStore.validPools.filter(
      p => (this.ido && p.pool.categoryPool === 'ido') || (!this.ido && p.pool.categoryPool === 'invest')
    )
  }

  @computed get upcommingsPools() {
    return this.filteredPools.filter(p => moment(p.pool.startDate).isAfter(moment()))
  }
  @computed get upcommingsProjects() {
    return this.filteredPools.filter(p => moment(p.pool.startDate).isAfter(moment()))
  }
  @computed get featuredPools() {
    return this.filteredPools.filter(
      p =>
        p.pool.address && moment().isSameOrAfter(moment(p.pool.startDate)) && moment().isBefore(moment(p.pool.endDate))
    )
  }
  @computed get closedPools() {
    return this.filteredPools.filter(p => moment(p.pool.endDate).isBefore(moment()))
  }
  @computed get slicedClosedPools() {
    return this.closedPools.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage)
  }
  @computed get hasUpcommingProjects() {
    return !!this.upcommingsProjects.length
  }
  @computed get hasUpcommings() {
    return !!this.upcommingsPools.length
  }
  @computed get hasFeaturedPools() {
    return !!this.featuredPools.length
  }
  @computed get hasClosedPools() {
    return !!this.closedPools.length
  }
  @computed get totalPools() {
    return this.closedPools.length
  }
  @computed get totalPage() {
    if (this.totalPools % this.itemsPerPage == 0) return this.totalPools / this.itemsPerPage
    return Math.floor(this.totalPools / this.itemsPerPage) + 1
  }
  @computed get exclusivePools() {
    return poolsStore.exclusivePools
  }
}
