import { FixedPoolModel } from '@/models/fixed-pool-model'
import Axios from 'axios'

export type ApiRouteType = 'users' | 'fixed-pools'

const axios = Axios.create({ baseURL: process.env.VUE_APP_API_ENDPOINT })

export class ApiHandler<T> {
  constructor(private route: ApiRouteType) {}

  async count(params?: any): Promise<number> {
    const res = await axios.get(`${this.route}/count`, { params })
    return res.data
  }

  async create(model: T): Promise<T> {
    const res = await axios.post(this.route, model)
    return res.data
  }

  async delete(id: any): Promise<T> {
    const res = await axios.delete(`${this.route}/${id}`)
    return res.data
  }

  async find<T>(params?: any, settings: { _sort?: string; _limit?: number; _start?: number } = {}): Promise<T[]> {
    const settingDefault = { _sort: 'index:DESC', _limit: 25, _start: 0 }
    params = { ...settingDefault, ...settings, ...(params ?? {}) }
    const res = await axios.get(this.route, { params })
    return res.data
  }

  async findOne<T>(id: any): Promise<T> {
    let res: any
    if (id) {
      res = await axios.get(`${this.route}/${id}`)
    } else {
      res = await axios.get(`${this.route}`)
    }
    return res.data
  }

  async update(id: any, model: T): Promise<T> {
    let res: any
    if (id) {
      res = await axios.put(`${this.route}/${id}`, model)
    } else {
      res = await axios.put(`${this.route}`, model)
    }
    return res.data
  }
}

export class ApiService {
  fixedPool = new ApiHandler<FixedPoolModel>('fixed-pools')

  async getFile(id: any) {
    const res = await axios.get(`upload/files/${id}`)
    return res.data
  }

  async getStakePoolInfo() {
    const res = await axios.get(`blockchains/stake-info`)
    return res.data
  }

  async getFarmInfo() {
    const res = await axios.get(`blockchains/farm-info`)
    return res.data
  }
}

export const apiService = new ApiService()
