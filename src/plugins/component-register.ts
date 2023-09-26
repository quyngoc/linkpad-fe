import Vue from 'vue'

export const componentRegister = () => {
  // Vue.component('company-footer', () => import('@/components/company-footer.vue'))
  Vue.component('card-hover', () => import('@/components/card-hover.vue'))
  Vue.component('app-avatar', () => import('@/components/images/app-avatar.vue'))
  Vue.component('app-logo', () => import('@/components/images/app-logo.vue'))
  Vue.component('app-tooltip', () => import('@/components/app-tooltip.vue'))
  Vue.component('connect-metamask', () => import('@/components/connect-metamask.vue'))
  Vue.component('chain-logo', () => import('@/components/chain-logo.vue'))
}
