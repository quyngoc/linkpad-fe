<template>
  <div class="fill-height background-1">
    <div style="max-width: 800px" class="mx-auto py-16 px-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-sheet color="dark2" rounded="lg" class="pa-6 mb-4">
            <div style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">Staking Details</div>
            <v-row dense>
              <v-col cols="12" md="12">
                <div class="d-flex align-center gap-2 mb-6">
                  <v-img :src="require('@/assets/logo/logo.png')" max-height="32" max-width="32"></v-img>
                  <div>
                    <div class="light2--text" style="font-size: 14px">Total stake</div>
                    <div class="text-head4 font-weight-bold">{{ vm.totalLockedAmount | formatNumber(0) }} Linkpad</div>
                  </div>
                </div>
              </v-col>
              <!-- <v-col cols="12" md="12">
                <div class="d-flex align-center gap-2 mb-4">
                  <v-img :src="require('@/assets/logo/logo.png')" max-height="32" max-width="32"></v-img>
                  <div>
                    <div class="light2--text" style="font-size: 14px">Total value locked (TVL)</div>
                    <div class="text-head4 font-weight-bold">${{ vm.totalValueLocked | formatNumber(5) }}</div>
                  </div>
                </div>
              </v-col> -->
              <v-col cols="12" md="12">
                <div class="d-flex align-center gap-2 mb-4">
                  <v-img :src="require('@/assets/logo/logo.png')" max-height="32" max-width="32"></v-img>
                  <div>
                    <div class="light2--text" style="font-size: 14px">APY</div>
                    <div class="text-head4 font-weight-bold">{{ vm.apy | round(0) }}%</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-sheet>
          <v-sheet color="dark2" rounded="lg" class="pa-4 mb-4">
            <div class="d-flex justify-center gap-16">
              <div class="cursor-pointer d-flex align-center primary--text" @click="getBSL">
                Get Linkpad
              </div>
              <div class="cursor-pointer d d-flex align-center primary--text" @click="viewLPContract">
                View Contract
              </div>
            </div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6">
          <v-sheet color="dark2" rounded="lg" class="pa-6">
            <div style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">Your Staking</div>
            <v-sheet color="#1E203D" rounded="lg" class="pa-4 mb-6">
              <div class="d-flex flex-column gap-2">
                <div class="d-flex justify-space-between align-center">
                  <div class="" style="font-size: 14px;">Your Staked</div>
                  <div class="text-body-bold text-end">{{ vm.stakedAmount | round(5) }} Linkpad</div>
                </div>
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

            <v-sheet color="#1E203D" rounded="lg" class="pa-4 mb-6">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="light2--text" style="font-size: 14px;">Pending reward</div>
                  <div style="font-size: 24px; font-weight: 700;">{{ vm.pendingReward | formatNumber(6) }}</div>
                </div>
                <v-btn
                  v-if="isChainIdValid"
                  depressed
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
                <v-btn depressed block color="gradient-btn" :loading="vm.approving" @click="vm.approve()">
                  Approve Contract
                </v-btn>
              </div>
              <div v-else>
                <v-row no-gutters>
                  <v-col cols="6" class="pr-2">
                    <v-btn depressed block color="gradient-btn" @click="requestStake">
                      Stake
                    </v-btn>
                  </v-col>
                  <v-col cols="6" class="pl-2">
                    <v-btn :disabled="!vm.canUnstake" outlined block @click="requestUnstake">Unstake</v-btn>
                  </v-col>
                </v-row>
              </div>
            </connect-metamask>

            <!-- <div class="d-flex justify-center mt-6 gap-16">
              <div class="cursor-pointer d-flex align-center blue--text" @click="getBSL">
                Get Linkpad<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
              </div>
              <div class="cursor-pointer d d-flex align-center blue--text" @click="viewLPContract">
                View Contract<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
              </div>
            </div> -->
          </v-sheet>
        </v-col>

        <v-col cols="12">
          <v-sheet :color="vm.userTier.color" rounded="lg" class="pa-6 mb-6 text-center">
            <div class="d-flex justify-center font-weight-bold mb-6" style="font-size: 24px;">
              Your Tier
            </div>
            <div class="d-flex full-width justify-center gap-6 mb-6">
              <v-img
                :src="require(`@/assets/images/tier${vm.userTier.index}.png`)"
                max-height="48"
                max-width="48"
              ></v-img>
              <div class="d-flex flex-column">
                <div style="font-size: 20px; font-weight: 700;">{{ vm.userTier.name }}</div>
                <div style="font-size: 14px; font-weight: 500;">{{ vm.userTier.allocationType }}</div>
              </div>
            </div>

            <v-row>
              <v-col cols="12" md="4" class="text-center">
                <div class="font-weight-bold">Staking Requirement</div>
                <div>{{ vm.userTier.requiredAmount | formatNumber }}</div>
              </v-col>
              <v-col cols="12" md="4" class="text-center">
                <div class="font-weight-bold">Staking period</div>
                <div>{{ vm.userTier.duration }}</div>
              </v-col>
              <v-col cols="12" md="4" class="text-center">
                <div class="font-weight-bold">Allocation size</div>
                <div>{{ vm.userTier.allocationSize | usd }}</div>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
      </v-row>

      <div class="d-flex justify-center font-weight-bold mb-6" style="font-size: 32px;">
        TIERS
      </div>
      <v-row>
        <v-col cols="12" md="6" v-for="tier in tiers" :key="tier.index" class="pa-4">
          <v-sheet rounded="lg" class="pb-2 tier-bg">
            <div class="d-flex justify-center align-center gap-2 pa-4">
              <v-img :src="require(`@/assets/images/tier${tier.index}.png`)" max-height="48" max-width="48"></v-img>
              <div class="text-body-bold">{{ tier.name }}</div>
            </div>
            <v-sheet rounded="lg" class="mx-4 d-flex justify-space-between align-center pa-4 item-bg">
              <div class="font-weight-bold">
                Staking Requirement
              </div>
              <div>{{ tier.requiredAmount | formatNumber }}</div>
            </v-sheet>
            <v-sheet rounded="lg" class="mx-4 my-2 d-flex justify-space-between align-center pa-4 item-bg">
              <div class="font-weight-bold">
                Allocation Weight
              </div>
              <div>{{ tier.allocationSize | formatNumber }}</div>
            </v-sheet>
            <v-sheet rounded="lg" class="mx-4 my-2 d-flex justify-space-between align-center pa-4 item-bg">
              <div class="font-weight-bold">
                Allocation Type
              </div>
              <div>{{ tier.allocationType }}</div>
            </v-sheet>
            <v-sheet rounded="lg" class="mx-4 my-2 d-flex justify-space-between align-center pa-4 item-bg">
              <div class="font-weight-bold">
                Staking Period
              </div>
              <div>{{ tier.duration }}</div>
            </v-sheet>
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
  chainID = process.env.VUE_APP_CHAIN_ID
  tiers = TIERS.slice(1)

  requestStake() {
    this.vm.requestStake()
  }

  requestUnstake() {
    this.vm.requestUnstake()
  }

  viewLPContract() {
    window.open(`https://bscscan.com/address/0xd370029c625BC09f035d0eCBBa3bF2072a810CaB`, '_blank')
  }
  getBSL() {
    window.open(`https://pancakeswap.finance/swap?outputCurrency=0xd370029c625BC09f035d0eCBBa3bF2072a810CaB`, '_blank')
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
.tier-bg {
  background-color: #2a2342 !important;
}
.item-bg {
  background-color: #000000 !important;
}
</style>
