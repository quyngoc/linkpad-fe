<template>
  <div class="fill-height background-1">
    <div style="max-width: 800px" class="mx-auto py-16 px-4">
      <v-row>
        <v-col cols="12">
          <v-sheet color="dark2" rounded="lg" class="pa-6">
            <div style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">MOMO Stats</div>
            <v-row dense>
              <v-col cols="12" md="4">
                <div class="d-flex align-center gap-2">
                  <v-img :src="require('@/assets/logo/momo-logo.png')" max-height="32" max-width="32"></v-img>
                  <div>
                    <div class="light2--text" style="font-size: 14px">Total stake</div>
                    <div class="text-head4 font-weight-bold">{{ vm.totalLockedAmount | formatNumber(0) }} MOMO</div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center gap-2">
                  <v-img :src="require('@/assets/logo/momo-logo.png')" max-height="32" max-width="32"></v-img>
                  <div>
                    <div class="light2--text" style="font-size: 14px">Total value locked (TVL)</div>
                    <div class="text-head4 font-weight-bold">${{ vm.tvl | formatNumber(5) }}</div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="d-flex align-center gap-2">
                  <v-img :src="require('@/assets/logo/momo-logo.png')" max-height="32" max-width="32"></v-img>
                  <div>
                    <div class="light2--text" style="font-size: 14px">APY</div>
                    <div class="text-head4 font-weight-bold">{{ vm.apy | round(0) }}%</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6">
          <v-sheet color="dark2" rounded="lg" class="pa-6">
            <div style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">My MOMO Staking</div>

            <v-sheet color="#1E203D" rounded="lg" class="pa-4 mb-4">
              <div class="d-flex flex-column gap-2">
                <div class="d-flex justify-space-between align-center">
                  <div class="" style="font-size: 14px;">Your Staked</div>
                  <div class="text-body-bold text-end">{{ vm.stakedAmount | round(5) }} MOMO</div>
                </div>
                <!-- <div class="d-flex justify-space-between">
                  <div class="font-weight-medium" style="font-size: 14px;">Staking period</div>
                  <div class="text-body-bold">{{ vm.lockInDays }} days</div>
                </div> -->
                <div class="d-flex justify-space-between align-center">
                  <div class="" style="font-size: 14px;">Lock token for</div>
                  <div class="text-body-bold text-end">{{ vm.lockInDays }} days</div>
                </div>
                <div class="d-flex justify-space-between align-center" v-if="vm.showUnstakeTime">
                  <div class="" style="font-size: 14px;">Unstake/Harvest time</div>
                  <div class="text-body-bold text-end">{{ vm.unstakeTime | datetime }}</div>
                </div>
              </div>
            </v-sheet>

            <v-sheet color="#1E203D" rounded="lg" class="pa-4 mb-4">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="light2--text" style="font-size: 14px;">Pending reward</div>
                  <div style="font-size: 24px; font-weight: 700;">{{ vm.pendingReward | formatNumber(6) }}</div>
                </div>
                <v-btn
                  v-if="isChainIdValid"
                  depressed
                  rounded
                  color="gradient-btn"
                  :disabled="!vm.canHavest"
                  @click="vm.setShowHavestDialog(true)"
                >
                  Harvest
                </v-btn>
              </div>
            </v-sheet>

            <connect-metamask block :requiredChainId="chainID" :class="{ 'mt-4 mb-3': !vm.isStaked }">
              <div v-if="!vm.approved">
                <v-btn depressed rounded block color="gradient-btn" :loading="vm.approving" @click="vm.approve()">
                  Approve Contract
                </v-btn>
              </div>
              <div v-else>
                <v-row no-gutters>
                  <v-col cols="6" class="pr-2">
                    <v-btn depressed rounded block color="gradient-btn" @click="requestStake">
                      Stake
                    </v-btn>
                  </v-col>
                  <v-col cols="6" class="pl-2">
                    <v-btn :disabled="!vm.canUnstake" outlined rounded block @click="requestUnstake">Unstake</v-btn>
                  </v-col>
                </v-row>
              </div>
            </connect-metamask>

            <div class="d-flex justify-center mt-6 gap-16">
              <div class="cursor-pointer d-flex align-center blue--text" @click="getBSL">
                Get MOMO<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
              </div>
              <div class="cursor-pointer d d-flex align-center blue--text" @click="viewLPContract">
                View Contract<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
              </div>
            </div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6">
          <v-sheet :color="vm.userTier.color" rounded="lg" class="pa-6 mb-6">
            <div class="d-flex gap-6 mb-6">
              <v-img :src="require('@/assets/logo/momo-logo.png')" max-height="48" max-width="48"> </v-img>
              <div class="d-flex flex-column">
                <div style="font-size: 20px; font-weight: 700;">{{ vm.userTier.name }}</div>
                <div style="font-size: 14px; font-weight: 500;">Guaranteed Allocation</div>
              </div>
            </div>

            <div class="d-flex flex-column gap-2 font-weight-medium" style="font-size: 14px;">
              <div class="d-flex justify-space-between">
                <div>Staking Requirement</div>
                <div>{{ vm.userTier.requiredAmount | formatNumber }}</div>
              </div>
              <div class="d-flex justify-space-between">
                <div>Staking period</div>
                <div>{{ vm.userTier.duration }}</div>
              </div>
              <div class="d-flex justify-space-between">
                <div>Allocation size</div>
                <div>{{ vm.userTier.allocationSize | usd }}</div>
              </div>
            </div>
          </v-sheet>

          <v-sheet color="dark2" rounded="lg" style="overflow: hidden;">
            <div class="pa-4" style="background: #1E203D">
              <div class="d-flex justify-space-between">
                <div class="text-body-bold">Tier</div>
                <div style="font-size: 14px;">Staked amount</div>
              </div>
            </div>
            <div v-for="tier in tiers" :key="tier.index" class="pa-4">
              <div class="d-flex justify-space-between">
                <div class="text-body-bold">{{ tier.name }}</div>
                <div style="font-size: 14px;">{{ tier.requiredAmount | formatNumber }}</div>
              </div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </div>
    <staking-dialog />
    <havest-dialog />
  </div>
</template>

<script lang="ts">
import { StakingViewModel } from '../viewmodels/staking-viewmodel'
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide, Ref } from 'vue-property-decorator'
import { walletStore } from '@/stores/wallet-store'
import { TIERS } from '@/constants'

@Observer
@Component({
  components: {
    'staking-dialog': () => import('../dialogs/staking-dialog.vue'),
    'havest-dialog': () => import('../dialogs/havest-dialog.vue')
  }
})
export default class Staking extends Vue {
  @Provide() vm = new StakingViewModel()
  @Ref('stakingDialog') stakingDialogController: any
  walletStore = walletStore
  chainID = process.env.VUE_APP_FARM_CHAIN_ID
  tiers = TIERS.slice(1)

  requestStake() {
    this.vm.requestStake()
  }

  requestUnstake() {
    this.vm.requestUnstake()
  }

  viewLPContract() {
    window.open(`https://etherscan.io/address/0x89D780a512Ea238e72Da4b9c1a621b693681c15a`, '_blank')
  }
  getBSL() {
    window.open(`https://app.uniswap.org/#/swap?outputCurrency=0x08d0222a206d1aee59a9b66969c04fd1e8a0f864`, '_blank')
  }

  get isChainIdValid() {
    return +this.chainID! === walletStore.chainId
  }

  destroyed() {
    this.vm.destroy()
  }
}
</script>

<style scoped>
.card-info {
  border-radius: 16px;
  background: transparent;
  border: 1px solid var(--v-border-base);
}
.staking-container {
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
