import { apiService } from '@/services/api-service'
import { action, computed, observable, reaction } from 'mobx'
import VueRouter from 'vue-router'
import { localData } from './stores/local-data'
import { walletStore } from './stores/wallet-store'

export class AppProvider {
  router!: VueRouter
  api = apiService
  wallet = walletStore

  @observable lightmode = false // localData.lightmode

  constructor() {
    reaction(
      () => this.lightmode,
      mode => (localData.lightmode = mode)
    )
  }

  @action toggleLightMode($vuetify) {
    this.lightmode = !this.lightmode
    $vuetify.theme.dark = !this.lightmode
  }

  @computed get themeType() {
    return this.lightmode ? 'light' : 'dark'
  }
}

export const appProvider = new AppProvider()
