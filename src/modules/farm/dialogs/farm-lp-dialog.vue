<template>
  <v-dialog :value="vm.isShowFarmDialog" max-width="400" persistent>
    <v-card color="dark2" rounded="lg" class="pa-5 d-flex flex-column gap-5">
      <div class="d-flex justify-space-between align-center">
        <div class="text-head3">{{ vm.isDialogFarm ? 'Stake LP tokens' : 'Unstake LP tokens' }}</div>
        <v-btn
          fab
          color="transparent"
          max-height="24"
          max-width="24"
          @click="vm.cancelFarmDialog"
          :disabled="vm.isDialogLoading"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="d-flex justify-space-between">
        <div class="light2--text" style="font-size: 14px;">Your staked</div>
        <div class="font-weight-bold">{{ vm.stakedLP | formatNumber(5) }} LP</div>
      </div>

      <div style="border: 1px solid var(--v-strock-base);" class="rounded-lg pa-4 pb-2">
        <div class="d-flex justify-space-between">
          <div class="light2--text" style="font-size: 14px;">{{ vm.isDialogFarm ? 'Stake' : 'Unstake' }}</div>
          <div class="light2--text" style="font-size: 14px;">
            Balance {{ vm.maxDialogFarmBalance | formatNumber(5) }} LP
          </div>
        </div>
        <v-text-field
          placeholder="0.0"
          hide-details
          solo
          dense
          background-color="transparent"
          flat
          class="text-head4"
          :value="vm.farmDialogInput"
          @input="vm.changeFarmDialogInput"
        >
          <template v-slot:append>
            <v-btn color="blue" x-small class="rounded" @click="vm.maximum">Max</v-btn>
          </template>
        </v-text-field>
      </div>

      <v-sheet v-if="vm.isDialogFarm" color="#1E203D" rounded="lg" class="pa-2">
        <div class="d-flex justify-space-between align-center">
          <div class="light2--text" style="font-size: 14px;">Total stake</div>
          <div class="font-weight-bold text-end">{{ vm.estimateTotalStake | formatNumber(5) }} LP</div>
        </div>
        <div class="d-flex justify-space-between align-center">
          <div class="light2--text" style="font-size: 14px;">Staking period</div>
          <div class="font-weight-bold text-end">{{ vm.lockInDays }} days</div>
        </div>
        <div class="d-flex justify-space-between align-center">
          <div class="light2--text" style="font-size: 14px;">Unstake / Harvest time</div>
          <div class="font-weight-bold text-end">{{ vm.estimatedUnstakeTime | datetime }}</div>
        </div>
      </v-sheet>

      <v-row no-gutters>
        <v-col cols="6" class="pr-2">
          <v-btn
            outlined
            color="blue"
            rounded
            block
            class="text-body-bold"
            style="letter-spacing: 0px;"
            @click="vm.cancelFarmDialog()"
            :disabled="vm.isDialogLoading"
          >
            Cancel
          </v-btn>
        </v-col>
        <v-col cols="6" class="pl-2">
          <v-btn
            color="gradient-btn"
            rounded
            block
            class="text-body-bold"
            style="letter-spacing: 0px;"
            :loading="vm.isDialogLoading"
            :disabled="!vm.validDialogInputAmount"
            @click="vm.confirm()"
          >
            Confirm
          </v-btn>
        </v-col>
      </v-row>

      <v-divider></v-divider>
      <div class="cursor-pointer d-flex justify-center blue--text" @click="getLP">
        Get MOMO-ETH LP<v-icon size="16" class="ml-1" color="blue">mdi-open-in-new</v-icon>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Inject, Vue } from 'vue-property-decorator'
import { FarmViewModel } from '../viewmodels/farm-viewmodel'

@Observer
@Component
export default class extends Vue {
  @Inject() vm!: FarmViewModel

  getLP() {
    window.open(`https://app.uniswap.org/#/add/ETH/0x08d0222a206d1aee59a9b66969c04fd1e8a0f864`, '_blank')
  }
}
</script>

<style scoped></style>
