<template>
  <v-app class="bg-color">
    <v-navigation-drawer v-model="drawer" app bottom :temporary="false" disable-resize-watcher>
      <v-list nav dense>
        <v-list-item @click="openPageInANewBlank('https://www.link-pad.io/')">
          Linkpad Home
        </v-list-item>
        <v-list-item to="/projects">
          Projects
        </v-list-item>
        <v-list-item to="/staking">
          Stake
        </v-list-item>
        <!-- <v-list-item to="/farming">
          Farming
        </v-list-item> -->
        <!-- <v-list-item to="/allAllocations">
          Your allocation
        </v-list-item> -->
        <v-list-item>
          <v-btn v-if="!wallet.connected" depressed class="gradient-btn" @click="providers.wallet.connect()">
            Connect Wallet
          </v-btn>
          <v-btn v-else depressed color="primary">
            {{ wallet.shortAccount }}
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app flat color="#170f32">
      <v-container>
        <div class="d-flex align-center">
          <router-link :to="`/projects`">
            <v-img
              alt="Linkpad Logo"
              contain
              :src="require('@/assets/logo/logo.png')"
              transition="scale-transition"
              class="mr-16"
              max-height="44"
              max-width="44"
            />
          </router-link>
          <div class="d-none d-md-flex align-center full-width gap-16">
            <div @click="openPageInANewBlank('https://www.link-pad.io/')" style="cursor: pointer;">
              Linkpad Home
            </div>
            <router-link to="/projects" active-class="font-weight-bold primary--text">Projects</router-link>
            <router-link to="/staking" active-class="font-weight-bold primary--text">Stake</router-link>
            <!-- <router-link to="/farming" active-class="font-weight-bold blue--text">Farming</router-link> -->
            <v-spacer></v-spacer>
            <div>
              <!-- <v-btn color="transparent" depressed rounded to="/allAllocations">
                Your allocation
              </v-btn> -->
              <v-btn v-if="!wallet.connected" depressed class="gradient-btn ml-4" @click="providers.wallet.connect()">
                Connect Wallet
              </v-btn>
              <v-btn v-else depressed color="#1E203D" class="ml-4 primary--text">
                {{ wallet.shortAccount }}
              </v-btn>
            </div>
          </div>

          <v-spacer></v-spacer>
          <v-app-bar-nav-icon class="d-flex d-md-none text-end" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </div>
      </v-container>
    </v-app-bar>
    <v-main style="background-color: #170f32">
      <router-view></router-view>
    </v-main>
    <v-footer class="transparent d-flex flex-column gap-10 py-12">
      <v-img :src="require('@/assets/logo/logo-2.png')" height="88" width="88"></v-img>

      <div class="d-flex align-center justify-center gap-5">
        <v-img
          class="cursor-pointer"
          :src="require('@/assets/icons/telegram.svg')"
          @click="openPageInANewBlank('https://t.me/linkpad_chat')"
        ></v-img>
        <v-img
          class="cursor-pointer"
          :src="require('@/assets/icons/telegram-2.svg')"
          @click="openPageInANewBlank('https://t.me/linkpad_news')"
        ></v-img>
        <v-img
          class="cursor-pointer"
          :src="require('@/assets/icons/twitter.svg')"
          @click="openPageInANewBlank('https://twitter.com/linkpad_ofc')"
        ></v-img>
      </div>

      <!-- <div class="d-flex justify-center gap-5">
        <span class="text-body-bold cursor-pointer" @click="openPageInANewBlank('https://momo-erc.gitbook.io/docs')"
          >WHITEPAPER</span
        >
        <span
          class="text-body-bold cursor-pointer"
          @click="openPageInANewBlank('https://play.google.com/store/apps/details?id=com.momo.wallet')"
          >Download MOMO V2 Wallet</span
        >
        <span class="text-body-bold cursor-pointer" @click="openPageInANewBlank('https://momo-erc.com/swap')"
          >MOMO V2 DEX</span
        >
      </div>

      <div class="text-body-bold">support@momo-erc.com</div> -->

      <div style="font-size: 14px;" class="light2--text">
        ©2023 LINKPAD, All Rights Reserved By <span class="white--text">LINKPAD</span>
      </div>
    </v-footer>
    <snack-bar />
    <alert />
    <global-loading />
    <v-dialog :value="!wallet.chainIdValid" persistent max-width="290" content-class="development-mode">
      <v-card rounded="md">
        <v-card-title class="headline secondary"> TESTNET ONLY </v-card-title>
        <v-card-text class="pt-4"> Development mode supports TESTNET only. Please change your network. </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Provide, Vue } from 'vue-property-decorator'
import { AppProvider, appProvider } from './app-providers'
import { walletStore } from './stores/wallet-store'

@Observer
@Component({
  components: {
    'snack-bar': () => import('@/components/snack-bar/snack-bar.vue'),
    alert: () => import('@/components/alert/alert.vue'),
    'global-loading': () => import('@/components/global-loading/global-loading.vue')
  }
})
export default class App extends Vue {
  @Provide() providers: AppProvider = appProvider

  wallet = this.providers.wallet

  mounted() {
    this.providers.router = this.$router
    walletStore.start()
  }

  drawer = false

  changeTheme() {
    this.providers.toggleLightMode(this.$vuetify)
  }

  openPageInANewBlank(url: string) {
    console.log(url)

    window.open(url, '_blank')
  }

  farm() {
    // snackController.success('Comming soon');
  }
}
</script>
<style lang="scss">
@import '@/styles/function.scss';
@import '@/styles/function.scss';
@import '@/styles/variables.scss';
a {
  text-decoration: none;
  color: white !important;
}
.bg-color {
  background: linear-gradient(0deg, #170f32 69.33%, #16182d 106.63%) !important;
}
.gradient-btn {
  // border-radius: 100px;
  // overflow: hidden;
  // position: relative;
  // transition: all 200ms ease;
  background: linear-gradient(135deg, #fa26ca 0%, #712af9 100%) !important;
}
// .gradient-btn span.v-btn__content {
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 3;
// }
// .gradient-btn::after {
//   background: linear-gradient(135deg, #fa26ca 0%, #712af9 100%) !important;
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   z-index: 1;
//   transition: all 200ms ease;
// }
// .gradient-btn::before {
//   content: '';
//   position: absolute;
//   top: 0 !important;
//   left: 50% !important;
//   width: 0;
//   height: 100%;
//   background: linear-gradient(90.99deg, #fdce39 0.27%, #fd8963 30%, #ed5174 98.69%) !important;
//   z-index: 2;
//   transition: all 200ms ease !important;
// }
// .gradient-btn:hover::before {
//   width: 100% !important;
//   left: 0 !important;
//   transition: all 200ms ease !important;
// }
.position-relative {
  position: relative !important;
}

.position-absolute {
  position: absolute !important;
}

.container {
  max-width: 1248px !important;
  padding: 0 24px;
}

.no-padding-text-field .v-input__slot {
  padding: 0px !important;
}

.virtual--border {
  border: 1px solid transparent !important;
}
.primary--border {
  border: 1px solid var(--v-primary-base) !important;
}

.line-height-1 {
  line-height: 1 !important;
}
.v-application {
  a {
    text-decoration: none;
    color: inherit !important;
  }
}
.development-mode {
  border-radius: 4px !important;
}
.full-height {
  height: 100% !important;
}
.full-width {
  width: 100% !important;
}
tbody {
  tr:hover {
    background-color: transparent !important;
  }
}
.image-box {
  background: linear-gradient(89.91deg, rgba(244, 175, 0, 0.5) 8.73%, #fff3d4 31.77%, rgba(233, 166, 0, 0.5) 55.82%);
  border: 3px solid transparent;
  border-radius: 16px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px grey;
  border-radius: 10px;
  background-color: transparent !important;
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: transparent !important;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: var(--v-subtitle-base);
}
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  color: #fa26ca;
}
</style>
