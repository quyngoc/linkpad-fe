<template>
  <v-dialog v-model="dialog" :max-width="$vuetify.breakpoint.smAndDown ? '350' : '400'" persistent>
    <v-card color="dark3" rounded="xl" class="pa-6">
      <div class="d-flex justify-space-between align-center mb-8">
        <div class="d-flex align-center">
          <div class="text-head4">Swap</div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                :loading="vm.loadingContrains"
                :disabled="vm.loadingContrains"
                @click="vm.getContractContrains()"
              >
                <v-icon>
                  mdi-refresh
                </v-icon>
              </v-btn>
            </template>
            Fetch new pool data
          </v-tooltip>
        </div>
        <v-btn
          depressed
          color="transparent"
          fab
          max-height="16"
          max-width="16"
          @click="cancel"
          :disabled="vm.swaping || vm.approving"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="pa-4 mb-5 card-border">
        <div class="d-flex flex-column gap-2">
          <div class="d-flex justify-space-between align-center">
            <div class="text-body light2--text" style="font-size: 14px;">Your tier</div>
            <div class="text-body-bold text-en">{{ vm.userTier.name }}</div>
          </div>
          <div class="d-flex justify-space-between align-center">
            <div class="text-body light2--text" style="font-size: 14px;">Your allocation size</div>
            <div class="text-body-bold text-end">{{ vm.userMaxAllocation }} {{ vm.tokenName }}</div>
          </div>
          <div class="d-flex justify-space-between align-center">
            <div class="text-body light2--text" style="font-size: 14px;">Price</div>
            <div class="text-body-bold text-end">${{ vm.ratioFn }}</div>
          </div>
        </div>
      </div>

      <v-sheet rounded="lg" style="background: #FFFFFF1A;" class="pa-4">
        <div class="mb-1 text-body-bold light2--text">
          Balance: {{ vm.tradeTokenBalance | round }} {{ vm.tradeToken }}
        </div>
        <v-text-field
          solo
          outlined
          background-color="transparent"
          height="56"
          dense
          class="rounded-lg"
          hide-details=""
          v-model="bnbCost"
          @input="userChangeBnbCost"
        >
          <template v-slot:append>
            <div class="d-flex align-center gap-1">
              <trade-token-name :vm="vm" />
            </div>
          </template>
        </v-text-field>
      </v-sheet>

      <v-sheet
        width="36"
        height="36"
        rounded="circle"
        color="primary"
        class="d-flex align-center justify-center mx-auto my-3"
      >
        <v-icon>mdi-arrow-down</v-icon>
      </v-sheet>

      <v-sheet rounded="lg" style="background: #FFFFFF1A;" class="pa-4">
        <div class="text-body-bold light2--text mb-1">
          Remaining: {{ vm.remainToken | formatNumber(2) }} {{ vm.tokenName }}
        </div>
        <v-text-field
          solo
          outlined
          background-color="transparent"
          height="56"
          dense
          class="rounded-lg"
          hide-details=""
          v-model="amountToken"
          @input="userChangeAmountToken"
        >
          <template v-slot:append>
            <div class="d-flex align-center gap-1">
              <!-- <app-logo :size="20" :avatar="vm.logoUrl" class="mr-4" /> -->
              <token-name :vm="vm"></token-name>
            </div>
          </template>
        </v-text-field>
        <!-- <div class="d-flex mt-1">
          <div class="light2--text" style="font-size: 14px;">Price:</div>
          <v-spacer></v-spacer>
          <div class="light2--text" style="font-size: 14px;">1 {{ '--' }} = {{ '--' }} {{ '--' }}</div>
        </div> -->

        <div class="px-1 mt-4" v-if="vm.isShowTax">
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <div class="text-subtitle-2 mr-1">Service fee ({{ vm.tax }}%)</div>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" size="18">
                    mdi-alert-circle-outline
                  </v-icon>
                </template>
                <div>Buyer will have to pay a service fee of {{ vm.tax }}% of purchase value</div>
              </v-tooltip>
            </div>
            <div class="text-caption">{{ fee }} {{ vm.tradeToken }}</div>
          </div>
          <div class="d-flex justify-space-between align-center">
            <div class="text-subtitle-2">Total pay</div>
            <div class="text-caption">{{ totalPay }} {{ vm.tradeToken }}</div>
          </div>
        </div>
      </v-sheet>

      <v-btn v-if="!vm.connected" block depressed color="primary mt-6" @click="vm.connectWallet()"
        >Connect Wallet</v-btn
      >
      <div v-else-if="!vm.approved">
        <v-btn
          block
          depressed
          class="gradient-btn mt-8"
          @click="approve"
          :loading="vm.approving"
          :disabled="vm.approved"
          >Approve</v-btn
        >
      </div>
      <div v-else>
        <v-btn depressed block @click="swap" :loading="vm.swaping" class="gradient-btn mt-8">
          Confirm swap
        </v-btn>
      </div>
      <div v-if="error" class="error--text text-caption mt-2">{{ error }}</div>
      <div v-if="vm.forceError" class="error--text text-caption mt-2">{{ vm.forceError }}</div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { promiseHelper } from '@/helpers/promise-helper'
import { FixedNumber } from '@ethersproject/bignumber'
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide } from 'vue-property-decorator'
import { IdoPoolSwapViewModel } from '../viewmodels/ido-pool-swap-viewmodel'

@Observer
@Component({
  components: {
    'trade-token-name': () => import('./trade-token-name.vue'),
    'token-name': () => import('./token-name.vue')
  }
})
export default class IdoPoolDSwap extends Vue {
  @Provide() vm = new IdoPoolSwapViewModel()

  tab = null
  bnbCost = ''
  amountToken = ''
  error = ''
  fee = '0'
  totalPay = '0'

  dialog = false
  resolve?: (any) => void

  async open() {
    this.dialog = true
    await promiseHelper.delay(100)
    this.vm.loadPool(this.$route.params.slugName)
    return new Promise(r => (this.resolve = r))
  }
  async cancel() {
    this.vm.cancelInterval()
    this.resolve && this.resolve(null)
    this.dialog = false
    await promiseHelper.delay(100)
    this.error = ''
    this.bnbCost = '0'
    this.amountToken = '0'
    this.fee = '0'
    this.totalPay = '0'
  }

  async approve() {
    try {
      this.error = ''
      await this.vm.approve()
    } catch (error) {
      this.error = error.message
    }
  }

  async swap() {
    try {
      this.error = ''
      await this.vm.swap(this.amountToken)
      this.bnbCost = '0'
      this.amountToken = '0'
      this.dialog = false
      this.fee = '0'
      this.totalPay = '0'
      this.$emit('done')
    } catch (error) {
      this.error = error.message
    }
  }

  maxBnb() {
    if (this.vm.tax) {
      this.bnbCost = this.vm.maxRemainPurchaseBnb
        .divUnsafe(
          FixedNumber.from('1').addUnsafe(FixedNumber.from(`${this.vm.tax}`).divUnsafe(FixedNumber.from('100')))
        )
        .toString()
    } else {
      this.bnbCost = this.vm.maxRemainPurchaseBnb + ''
    }
    this.userChangeBnbCost(this.bnbCost)
  }

  userChangeBnbCost($event) {
    this.error = ''
    const amountToken = this.vm.calculateAmountToken($event)
    this.amountToken = amountToken.toString()
    this.getTotalPay()
  }

  async userChangeAmountToken($event) {
    this.error = ''
    const bnbCost = await this.vm.calculateBnbCost($event)
    this.bnbCost = bnbCost.toString()
    this.getTotalPay()
  }

  getTotalPay() {
    if (this.vm.tax) {
      try {
        const bnbCost = FixedNumber.from(this.bnbCost)
        const fee = bnbCost.mulUnsafe(FixedNumber.from(`${this.vm.tax}`)).divUnsafe(FixedNumber.from('100'))
        const totalPay = bnbCost.addUnsafe(fee)

        this.fee = fee.toString()
        this.totalPay = totalPay.toString()
      } catch (error) {
        this.fee = '0'
        this.totalPay = '0'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.root {
  width: 100%;
  background: url('../../../assets/images/background.svg') repeat-y;
  background-position: center top;
}
.input {
  font-weight: 600;
}

.border-gradient {
  border: 1px solid;
  border-image-slice: 1;
  border-width: 1px;
  border-radius: 10px !important;
}
.border-gradient-something {
  border-image-source: linear-gradient(94deg, #0146ff 1.82%, #4917a3 81.63%) !important;
}
.card-border {
  border-radius: 8px;
  border: 1px solid var(--v-primary-base);
}
</style>
