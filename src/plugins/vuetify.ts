import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// import settingsSvg from '../assets/icons/settings.svg'

Vue.use(Vuetify)

export default new Vuetify({
  iconfont: 'fa',
  icons: {
    iconfont: 'fa',
    values: {
      // settings: settingsSvg
    }
  },
  theme: {
    dark: true,
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: {
          base: '#FFC107',
          lighten1: '#F3F5F6'
        },
        success: {
          base: '#5FCD5B',
          lighten1: '#dff5de'
        },
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#F44336',
        info: '#2196F3',
        warning: '#FFC107',
        border: '#dee3e8',
        cardHoverBg: '#ffffff'
      },
      dark: {
        dark2: '#16182D',
        dark3: '#2a2342',
        light2: '#9CA0D2',
        white: '#FFFFFF',
        blue: '#02E2E3',
        semGreen: '#28A134',
        yellow2: '#FCE8C0',
        strock: '#23263E'
      }
    }
  }
})
