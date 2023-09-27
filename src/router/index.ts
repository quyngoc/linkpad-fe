import { walletStore } from '@/stores/wallet-store'
import { when } from 'mobx'
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  { path: '/', redirect: '/launch-pad' },
  {
    path: '/launch-pad',
    name: 'IDOPools',
    component: () => import('../modules/ido/pages/ido-pools.vue')
  },
  // {
  //   path: '/farming',
  //   name: 'Farm',
  //   component: () => import('../modules/farm/pages/farm.vue')
  // },
  {
    path: '/staking',
    name: 'Staking',
    component: () => import('../modules/staking/pages/staking.vue')
  },
  {
    path: '/invest',
    name: 'BInvest',
    component: () => import('../modules/ido/pages/ido-pools.vue')
  },
  {
    path: '/pool/:slugName',
    name: 'IDOPoolDetail',
    component: () => import('../modules/ido/pages/ido-pool-detail.vue')
  },
  {
    path: '/allPools',
    name: 'AllPools',
    component: () => import('../modules/ido/pages/all-pools.vue')
  },
  {
    path: '/allAllocations',
    name: 'AllAllocations',
    component: () => import('../modules/ido/pages/all-allocations.vue')
  },
  {
    path: '/b-nft',
    name: 'NFTPools',
    component: () => import('../modules/nft/pages/pools.vue')
  },
  {
    path: '/b-nft/:name',
    name: 'NFTPoolDetail',
    component: () => import('../modules/nft/pages/pool-detail.vue')
  },
  {
    path: '/settingSolana',
    name: 'SettingSolanaWallet',
    component: () => import('../modules/ido/pages/setting-solana-wallet.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  await when(() => walletStore.loaded)
  next()
})

export default router
