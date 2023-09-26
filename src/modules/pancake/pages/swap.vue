<template>
  <div class="primary lighten-1 root pa-6">
    <div class="main-form">
      <v-card rounded="xl" class="pa-6" elevation="4">
        <div class="d-flex justify-space-between align-center">
          <div class="text-h5 font-weight-bold">Swap</div>
          <v-btn icon x-small @click="openSetting">
            <v-icon>settings</v-icon>
          </v-btn>
        </div>
        <v-sheet class="pa-4 pb-1 my-4" rounded="xl" outlined>
          <div class="d-flex justify-space-between align-center">
            <div>From</div>
            <div>Balance: 0.0</div>
          </div>
          <v-text-field hide-details flat solo single-line placeholder="0.0" class="input no-padding-text-field">
            <v-btn slot="append" text class="px-2" style="border-radius: 12px" @click="selectToken">
              <app-avatar size="28" />
              BNB
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </v-text-field>
        </v-sheet>
        <div class="d-flex justify-space-around">
          <v-btn fab depressed x-small>
            <v-icon dark>
              mdi-arrow-down
            </v-icon>
          </v-btn>
        </div>
        <v-sheet class="pa-4 pb-1 my-4" rounded="xl" outlined>
          <div class="d-flex justify-space-between align-center">
            <div>To</div>
            <div>Balance: 0.0</div>
          </div>
          <v-text-field hide-details flat solo single-line placeholder="0.0" class="input no-padding-text-field">
            <v-btn slot="append" text class="px-2" style="border-radius: 12px" @click="selectToken">
              Select a currency
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </v-text-field>
        </v-sheet>
        <div class="d-flex justify-space-between align-center">
          <div>Price</div>
          <div>
            <span class="text-body-2">0.235876 ETH per AAVE</span>
            <v-btn icon x-small><v-icon color="grey darken-2">mdi-swap-horizontal</v-icon></v-btn>
          </div>
        </div>
        <v-btn block depressed color="primary mt-4">Connect Wallet</v-btn>
      </v-card>
      <v-sheet rounded="xl" class="pa-4 pt-10 information-card">
        <div class="d-flex justify-space-between align-center">
          <div>
            <span class="text-body-2 font-weight-medium mr-2">Minimum received</span>
            <v-btn icon x-small color="grey"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
          </div>
          <span class="text-body-2">0.4215 AAVE</span>
        </div>
        <div class="d-flex justify-space-between align-center pt-2">
          <div>
            <span class="text-body-2 font-weight-medium mr-2">Price Impact</span>
            <v-btn icon x-small color="grey"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
          </div>
          <span class="text-body-2 success--text"> &lt; 0.01%</span>
        </div>
        <div class="d-flex justify-space-between align-center pt-2">
          <div>
            <span class="text-body-2 font-weight-medium mr-2">Liquidity Provider Fee</span>
            <v-btn icon x-small color="grey"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
          </div>
          <span class="text-body-2">0.0006 ETH</span>
        </div>
      </v-sheet>
    </div>
    <token-select-dialog ref="tokenSelectDialog" />
    <settings-dialog ref="settingsDialog" />
  </div>
</template>

<script>
import SettingsDialog from '../dialogs/settings-dialog.vue'
import tokenSelectDialog from '../dialogs/token-select-dialog.vue'
import { Observer } from 'mobx-vue'
import { Component, Vue } from 'vue-property-decorator'

@Observer
@Component({ components: { tokenSelectDialog, SettingsDialog } })
export default class PancakeSwap extends Vue {
  async selectToken() {
    const selected = await this.$refs.tokenSelectDialog.open()
  }
  async openSetting() {
    const selected = await this.$refs.settingsDialog.open()
  }
}
</script>

<style scoped lang="scss">
.root {
  height: 100%;
  width: 100%;
  background: url('../../../assets/images/background2.svg') no-repeat center center;
}
.main-form {
  position: relative;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  max-width: 420px;
  .information-card {
    position: absolute;
    top: calc(100% - 30px);
    z-index: -1;
    left: 16px;
    right: 16px;
  }
}
.input {
  font-weight: 600;
}
</style>
