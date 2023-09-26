<template>
  <v-dialog v-model="dialog" :max-width="$vuetify.breakpoint.smAndDown ? '350' : '400'" persistent>
    <v-card color="dark2" rounded="xl" class="pa-6">
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

      <div class="pa-4 mb-5" style="border-radius: 10px;border: 1px solid var(--v-blue-base);">
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
            <div class="text-body-bold text-end">1 {{ vm.tokenName }} = {{ vm.ratioFn }} {{ vm.tradeToken }}</div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <div class="mb-1 text-body-bold light2--text text-end">
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
              <v-btn depressed color="transparent" class="blue--text text-head4 cursor-pointer" @click="maxBnb">
                Max
              </v-btn>
              <trade-token-name :vm="vm" />
            </div>
          </template>
        </v-text-field>
      </div>

      <v-sheet
        width="36"
        height="36"
        rounded="circle"
        color="strock"
        class="d-flex align-center justify-center mx-auto mb-3"
      >
        <v-icon>mdi-arrow-down</v-icon>
      </v-sheet>

      <div>
        <div class="text-body-bold light2--text text-end mb-1">
          Remaining: {{ vm.remainToken | formatNumber(2) }} tokens
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
      </div>

      <v-btn v-if="!vm.connected" block depressed color="primary mt-6" @click="vm.connectWallet()"
        >Connect Wallet</v-btn
      >
      <div v-else-if="!vm.approved">
        <v-btn
          block
          rounded
          depressed
          class="gradient-btn mt-8"
          @click="approve"
          :loading="vm.approving"
          :disabled="vm.approved"
          >Approve</v-btn
        >
      </div>
      <div v-else>
        <v-btn depressed rounded block @click="swap" :loading="vm.swaping" class="gradient-btn mt-8">
          Swap
        </v-btn>
      </div>
      <div v-if="error" class="error--text text-caption mt-2">{{ error }}</div>
      <div v-if="vm.forceError" class="error--text text-caption mt-2">{{ vm.forceError }}</div>
    </v-card>
    <!-- <div class="v-application--wrap">
      <div class="primary lighten-1 root pb-16">
        <div class="px-6">
          <v-card rounded="xl" class="pa-6 mx-auto" max-width="420" elevation="4">
            <div class="d-flex justify-space-between align-center">
              <div class="text-h5 font-weight-bold">Swap</div>
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
            <v-sheet class="pa-4 pb-1 my-4" rounded="xl" outlined>
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-2">From</div>
                <div class="text-caption">Balance: {{ vm.tradeTokenBalance | round }} {{ vm.tradeToken }}</div>
              </div>
              <v-text-field
                hide-details
                flat
                solo
                single-line
                placeholder="0.0"
                class="input no-padding-text-field"
                v-model="bnbCost"
                @input="userChangeBnbCost"
              >
                <div slot="append" class="d-flex align-center">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn v-bind="attrs" v-on="on" x-small outlined @click="maxBnb">
                        Max
                      </v-btn>
                    </template>
                    <div class="d-flex flex-column">
                      <span>
                        Your Staked BSL Balance:
                        <span class="font-weight-bold">{{ vm.requiredTokenBalance | round }}</span>
                      </span>
                      <span>
                        Your Locked LP Balance: <span class="font-weight-bold">{{ vm.lpLockedBalance | round }}</span>
                      </span>
                      <v-divider class="my-2" />
                      <span>
                        Maximum Tokens: <span class="font-weight-bold">{{ vm.maximumToken | round }}</span>
                      </span>
                      <span>
                        Maximum {{ vm.tradeToken }}:
                        <span class="font-weight-bold">{{ vm.possibleMaxTradeToken | round }}</span>
                      </span>
                      <v-divider class="my-2" />
                      <span>
                        Your Allocated Tokens:
                        <span class="font-weight-bold">{{ vm.purchasedToken | round }}</span>
                      </span>
                    </div>
                  </v-tooltip>
                  <span class="primary--text ml-3">{{ vm.tradeToken }}</span>
                </div>
              </v-text-field>
            </v-sheet>
            <div class="d-flex justify-space-around">
              <v-icon>
                mdi-arrow-down
              </v-icon>
            </div>
            <v-sheet class="pa-4 pb-1 my-4" rounded="xl" outlined>
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-2">To</div>
                <div class="text-caption">Remaining: {{ vm.remainToken | round }} tokens</div>
              </div>
              <v-text-field
                hide-details
                flat
                solo
                single-line
                placeholder="0.0"
                class="input no-padding-text-field"
                v-model="amountToken"
                @input="userChangeAmountToken"
              >
              </v-text-field>
            </v-sheet>
            <v-sheet class="px-1" v-if="vm.tax">
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <div class="text-subtitle-2 mr-1">Service fee ({{ vm.tax }}%)</div>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on" size="18">
                        mdi-alert-circle-outline
                      </v-icon>
                    </template>
                    <div>
                      Buyer will have to pay a service fee of 5% of purchase value
                    </div>
                  </v-tooltip>
                </div>
                <div class="text-caption">{{ fee }}</div>
              </div>
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-2">Total pay</div>
                <div class="text-caption">{{ totalPay }}</div>
              </div>
            </v-sheet>

            <v-btn v-if="!vm.connected" block depressed color="primary mt-6" @click="vm.connectWallet()"
              >Connect Wallet</v-btn
            >
            <v-row v-else class="d-flex mt-4">
              <v-col cols="6" v-if="vm.tradeByErc20">
                <v-btn block depressed color="primary" @click="approve" :loading="vm.approving" :disabled="vm.approved"
                  >Approve</v-btn
                >
              </v-col>
              <v-col :cols="vm.tradeByErc20 ? '6' : '12'">
                <v-btn block depressed color="primary" @click="swap" :loading="vm.swaping" :disabled="!vm.enableSwap"
                  >Swap</v-btn
                >
              </v-col>
            </v-row>
            <div v-if="error" class="error--text text-caption mt-2">{{ error }}</div>
            <div v-if="vm.forceError" class="error--text text-caption mt-2">{{ vm.forceError }}</div>
          </v-card>
        </div>
      </div>

      <company-footer />
    </div> -->
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
</style>
