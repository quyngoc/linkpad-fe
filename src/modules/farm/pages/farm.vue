<template>
  <div class="fill-height background-1">
    <div style="max-width: 400px" class="mx-auto pt-16 px-4">
      <v-card color="dark2" rounded="lg" class="pa-5" style="box-shadow: 0px 0px 13px 0px #02E2E3;">
        <div class="d-flex align-center gap-4 mb-10">
          <v-img :src="require(`@/assets/icons/farm-logo.svg`)" max-width="100px"></v-img>
          <div class="text-head3">ETH / LINKPAD</div>
        </div>
        <div class="mb-4">
          <div class="d-flex align-center mb-2">
            <div class="light2--text d-flex align-center" style="font-size: 14px;">
              APR <app-tooltip text="Annual Percentage Rate" />
            </div>
            <v-spacer></v-spacer>
            <div class="font-weight-bold">{{ vm.annualPercentageRate | round(0) }}%</div>
          </div>
          <div class="d-flex align-center">
            <div class="light2--text d-flex align-center" style="font-size: 14px;">
              Total Liquidity <app-tooltip text="Total value of the funds in this farm’s liquidity pool" />
            </div>
            <v-spacer></v-spacer>
            <div class="font-weight-bold">{{ vm.totalLiquidity | round(2) | usd }}</div>
          </div>
          <div class="d-flex align-center my-2">
            <div class="light2--text d-flex align-center" style="font-size: 14px;">
              Staking period
            </div>
            <v-spacer></v-spacer>
            <div class="font-weight-bold">{{ vm.lockInDays }} days</div>
          </div>
          <div class="d-flex align-center my-2" v-if="vm.showUnstakeTime">
            <div class="light2--text d-flex align-center" style="font-size: 14px;">
              Unstake / Harvest time
            </div>
            <v-spacer></v-spacer>
            <div class="font-weight-bold">{{ vm.unstakeTime | datetime }}</div>
          </div>
        </div>

        <div style="border: 1px solid var(--v-strock-base);" class="rounded-lg pa-4 mb-4">
          <div class="text-caption text--secondary">REWARD EARNED</div>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6">{{ vm.rewardAmount | round }}</div>
            <v-btn
              depressed
              rounded
              class="gradient-btn"
              :disabled="!vm.canHarvest"
              :loading="vm.harvesting"
              @click="vm.harvest()"
            >
              Harvest
            </v-btn>
          </div>
        </div>
        <div class="light2--text mb-1" style="font-size: 14px;">LINKPAD/ETH LP Staked</div>

        <v-col cols="12">
          <div class="text-h6">{{ vm.stakedLP | formatNumber }}</div>
        </v-col>

        <connect-metamask block :requiredChainId="chainId" class="mb-4">
          <div v-if="!vm.approved">
            <v-btn
              depressed
              block
              rounded
              color="gradient-btn"
              class="mb-2"
              :loading="vm.approving"
              @click="vm.approve()"
            >
              Approve Contract
            </v-btn>
          </div>
          <div v-else>
            <v-row>
              <v-col cols="6" class="pr-2">
                <v-btn depressed block rounded color="gradient-btn" class="mb-2" @click="vm.requestStakeLP()">
                  Stake LP
                </v-btn>
              </v-col>
              <v-col cols="6" class="prl-2">
                <v-btn
                  outlined
                  block
                  rounded
                  color="blue"
                  class="mb-2"
                  :disabled="!vm.canUnstake"
                  @click="vm.requestUnstakeLP()"
                >
                  Unstake LP
                </v-btn>
              </v-col>
            </v-row>
          </div>
          <!-- <div v-else>
            <div class="d-flex justify-space-between align-center">
              <div class="text-h6">{{ vm.stakedLP | round }}</div>
              <div>
                <v-btn color="gradient-btn" rounded depressed @click="vm.requestStakeLP()" large icon>
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
                <v-btn color="gradient-btn" @click="vm.requestUnstakeLP()" large icon>
                  <v-icon>mdi-minus-circle-outline</v-icon>
                </v-btn>
              </div>
            </div>
          </div> -->
        </connect-metamask>

        <v-divider class="mb-4"></v-divider>

        <div class="d-flex justify-space-between detail-info mb-2">
          <div class="cursor-pointer d-flex align-center blue--text" @click="getBSL">
            Get LINKPAD<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
          </div>
          <div class="cursor-pointer d d-flex align-center blue--text" @click="viewLPContract">
            View Contract<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
          </div>
        </div>
        <div class="d-flex justify-space-between detail-info">
          <div class="cursor-pointer d-flex align-center blue--text" @click="getLP">
            Get LINKPAD - ETH LP<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
          </div>
          <div class="cursor-pointer d d-flex align-center blue--text" @click="seePool">
            See Pair Info<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
          </div>
        </div>
      </v-card>
    </div>
    <farm-lp-dialog ref="farmDialog" />
  </div>
</template>

<script lang="ts">
import { FarmViewModel } from '../viewmodels/farm-viewmodel'
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide } from 'vue-property-decorator'
import { walletStore } from '@/stores/wallet-store'

@Observer
@Component({
  components: {
    'farm-lp-dialog': () => import('../dialogs/farm-lp-dialog.vue')
  }
})
export default class Farm extends Vue {
  @Provide() vm = new FarmViewModel()
  walletStore = walletStore
  chainId = process.env.VUE_APP_FARM_CHAIN_ID!

  getLP() {
    window.open(`https://app.uniswap.org/#/add/ETH/0x08d0222a206d1aee59a9b66969c04fd1e8a0f864`, '_blank')
  }
  viewLPContract() {
    window.open(`https://etherscan.io/address/0x89D780a512Ea238e72Da4b9c1a621b693681c15a`, '_blank')
  }
  seePool() {
    window.open(`https://app.uniswap.org/#/pool/0x08d0222a206d1aee59a9b66969c04fd1e8a0f864`, '_blank')
  }
  getBSL() {
    window.open(`https://app.uniswap.org/#/swap?outputCurrency=0x08d0222a206d1aee59a9b66969c04fd1e8a0f864`, '_blank')
  }

  destroyed() {
    this.vm.destroy()
  }
}
</script>

<style scoped>
::v-deep .v-input__slot {
  padding: 0 !important;
}
.card-info {
  border-radius: 16px;
  background: transparent;
  border: 1px solid var(--v-border-base);
}
.farm-container {
  max-width: 400px !important;
  min-height: 800px;
}
.hand {
  cursor: pointer;
}
.farm-card {
  box-shadow: 0 0 6px var(--v-primary-lighten2);
  background: var(--v-primary-lighten1) !important;
}
.detail-info {
  color: var(--v-primary-lighten2) !important;
}
.background-1 {
  background: var(--v-primary-lighten1);
  background-image: url('~@/assets/images/header-img.png');
  background-size: cover;
  background-repeat: no-repeat;
}
.hover-unstake:hover * {
  font-weight: 900;
}
</style>
