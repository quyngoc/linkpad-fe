import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import { componentRegister } from './plugins/component-register'
import { directiveRegister } from './plugins/directive-register'
import { pluginsRegister } from './plugins/plugins-register'
import { vueFilterRegister } from './plugins/vue-filter-register'
import { lineClamp } from 'vue-line-clamp-extended'
import vuescroll from 'vuescroll'

Vue.config.productionTip = false
Vue.use(vuescroll, {
  ops: {
    bar: {
      background: '#FFC10766'
    }
  }
})
Vue.directive('line-clamp', lineClamp as any)

// app configs
pluginsRegister()
componentRegister()
directiveRegister()
vueFilterRegister()

const lightFavicon = document.querySelector('link#favicon-light')!
const darkFavicon = document.querySelector('link#favicon-dark')!

const systemDarkMatcher = window.matchMedia('(prefers-color-scheme: dark)')
const onSystemDarkMatcherChanged = () => {
  const dark = systemDarkMatcher.matches
  if (dark) {
    lightFavicon.remove()
    document.head.append(darkFavicon)
  } else {
    darkFavicon.remove()
    document.head.append(lightFavicon)
  }
}
systemDarkMatcher.onchange = () => onSystemDarkMatcherChanged()
onSystemDarkMatcherChanged()

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
