<template>
  <v-dialog v-model="vm.isShowStakeDialog" width="488px" persistent>
    <v-card color="dark2" rounded="lg" class="pa-6">
      <div class="d-flex justify-space-between align-center mb-6">
        <div class="text-head4">{{ vm.isDialogStaking ? 'Stake' : 'Unstake' }}</div>
        <v-btn
          depressed
          color="transparent"
          fab
          max-height="16"
          max-width="16"
          @click="vm.cancelStakeDialog"
          :disabled="vm.isDialogLoading"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="d-flex flex-column gap-3">
        <v-sheet v-if="vm.isDialogStaking && vm.isStaked" color="#1E203D" rounded="lg" class="pa-4">
          <div class="d-flex flex-column gap-2 " style="font-size: 14px;">
            <div class="d-flex justify-space-between">
              <div>Your staked</div>
              <div class="font-weight-bold">{{ vm.stakedAmount | round(5) }} LINKPAD</div>
            </div>
            <div class="d-flex justify-space-between">
              <div>Lock time</div>
              <div class="font-weight-bold">{{ vm.lockInDays }} days</div>
            </div>
            <div class="d-flex justify-space-between">
              <div>Current tier</div>
              <div class="font-weight-bold">{{ vm.userTier.name }}</div>
            </div>
          </div>
        </v-sheet>

        <div v-if="vm.isDialogStaking">
          <div class="d-flex justify-space-between mb-1">
            <div style="font-size: 14px;">Stake amount</div>
            <div style="font-size: 14px;" class="text-end light2--text">
              Balance: {{ vm.userTokenBalance | round(5) }} LINKPAD
            </div>
          </div>
          <v-text-field
            solo
            flat
            hide-details
            background-color="#1E203D"
            :value="vm.isDialogStaking ? vm.stakeDialogInput : vm.stakedAmount"
            :disabled="vm.isDialogLoading"
            @input="vm.changeStakeDialogInput"
          >
            <template v-slot:append>
              <div class="text-head4 white--text">LINKPAD</div>
            </template>
          </v-text-field>
        </div>
        <div v-else>
          <div class="d-flex justify-space-between mb-1">
            <div style="font-size: 14px;">Unstake amount</div>
          </div>
          <span class="d-flex justify-center mt-4" background-color="#1E203D">
            <div class="text-head4 white--text">{{ vm.stakedAmount | round(5) }} LINKPAD</div>
          </span>
        </div>

        <div v-if="vm.isDialogStaking" class="text-center">
          <v-icon class="mx-2" dark> mdi-arrow-down </v-icon>
        </div>

        <v-sheet v-if="vm.isDialogStaking" color="#1E203D" rounded="lg" class="pa-2">
          <div class="d-flex justify-space-between ma-4">
            <div>Total stake</div>
            <div class="text-end font-weight-bold">{{ vm.estimateTotalStake | formatNumber(5) }} LINKPAD</div>
          </div>
          <v-sheet color="dark3" rounded="lg" class="pa-6">
            <div class="d-flex align-center gap-3 mb-4">
              <v-img
                :src="require(`@/assets/images/tier${vm.estimateUserTier.index}.png`)"
                max-height="32"
                max-width="32"
              ></v-img>
              <div style="font-size: 20px; font-weight: 700;">{{ vm.estimateUserTier.name }}</div>
              <div style="font-size: 14px; font-weight: 500;">{{ vm.estimateUserTier.allocationType }}</div>
            </div>

            <div class="d-flex flex-column gap-2 font-weight-medium" style="font-size: 14px;">
              <div class="d-flex justify-space-between">
                <div>Staking Requirement</div>
                <div>{{ vm.estimateUserTier.requiredAmount | formatNumber }}</div>
              </div>
              <div class="d-flex justify-space-between">
                <div>Staking period</div>
                <div>{{ vm.estimateUserTier.duration }}</div>
              </div>
              <div class="d-flex justify-space-between">
                <div>Allocation size</div>
                <div>{{ vm.estimateUserTier.allocationSize | usd }}</div>
              </div>
            </div>
          </v-sheet>

          <div class="pa-4">
            <div style="font-size: 14px;" class="mb-4">Lock tokens until {{ vm.estimatedUnstakeTime | datetime }}</div>
            <div style="font-size: 14px;">
              Tokens are locked they cannot be withdrawn under any circumstances until the timer has expired.
            </div>
          </div>
        </v-sheet>

        <v-row class="mt-4">
          <v-col cols="6">
            <v-btn block depressed rounded outlined @click="vm.cancelStakeDialog()" :disabled="vm.isDialogLoading"
              >Cancel</v-btn
            >
          </v-col>
          <v-col cols="6">
            <v-btn
              block
              rounded
              depressed
              color="gradient-btn"
              :disabled="vm.isDialogStaking ? !vm.validDialogInputAmount : false"
              :loading="vm.isDialogLoading"
              @click="vm.confirm()"
            >
              Confirm
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <!-- <v-card-title class="dialog-title"
        >{{ vm.isDialogStaking ? 'Stake BSL tokens' : 'Unstake BSL tokens' }}<v-spacer />
        <v-icon class="mr-n1" @click="vm.cancelStakeDialog" :disabled="vm.isDialogLoading"
          >mdi-close</v-icon
        ></v-card-title
      >
      <v-card-text>
        <div class="px-6 pt-5 pb-2 card-round mt-4">
          <div class="d-flex text-body-1 font-weight-bold">
            <div>{{ vm.isDialogStaking ? 'Stake' : 'Unstake' }}</div>
            <v-spacer></v-spacer>
            <div>Balance {{ vm.maxDialogStakeBalance | round }}</div>
          </div>
          <v-text-field
            hide-details
            flat
            solo
            single-line
            placeholder="0.0"
            class="no-padding-text-field mt-4 font-weight-bold text-h6"
            :value="vm.stakeDialogInput"
            @input="vm.changeStakeDialogInput"
          >
            <div slot="append" class="d-flex align-center">
              <v-btn small depressed @click="vm.maximum" color="primary"> Max </v-btn>
              <div class="ml-2 text-body-1 font-weight-bold" v-if="$vuetify.breakpoint.smAndUp">BSL</div>
            </div>
          </v-text-field>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex flex-column px-6 align-stretch">
        <v-row>
          <v-col cols="6">
            <v-btn
              class="primary-border"
              block
              depressed
              color="primary"
              outlined
              @click="vm.cancelStakeDialog()"
              :disabled="vm.isDialogLoading"
              >Cancel</v-btn
            >
          </v-col>
          <v-col cols="6">
            <v-btn
              block
              depressed
              color="primary"
              :disabled="!vm.validDialogInputAmount"
              :loading="vm.isDialogLoading"
              @click="vm.confirm()"
            >
              Confirm
            </v-btn>
          </v-col>
        </v-row>
        <div v-if="vm.isDialogStaking" class="d-flex justify-space-between mt-4 font-weight-medium">
          <div>
            Lock token for:
            <app-tooltip text="Token will be locked in this time." />
          </div>
          <div>{{ vm.lockInDays }} days</div>
        </div>
        <div v-else class="d-flex justify-space-between mt-4 font-weight-medium">
          <div>Unlock time: <app-tooltip text="You can unstake after this time." /></div>
          <div>{{ vm.canUnstakeTime | ddmmyyyyhhmmss }}</div>
        </div>
        <div class="my-4 d-flex justify-center">
          <v-btn class="text-none" color="primary" text @click="getMOMO"
            >Get MOMO<v-icon>mdi-open-in-new</v-icon></v-btn
          >
        </div>
      </v-card-actions> -->
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Vue, Inject } from 'vue-property-decorator'
import { StakingViewModel } from '../viewmodels/staking-viewmodel'
@Observer
@Component({})
export default class StakingDialog extends Vue {
  @Inject() vm!: StakingViewModel
  getMOMO() {
    window.open(`https://pancakeswap.finance/swap?outputCurrency=${this.vm.stakingHandler!.poolToken}`, '_blank')
  }
}
</script>

<style lang="scss"></style>
