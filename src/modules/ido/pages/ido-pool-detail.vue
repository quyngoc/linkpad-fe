<template>
  <div class="fill-height d-flex align-center justify-center" v-if="!vm.pool">
    <v-progress-circular indeterminate color="primary" class="mx-auto"></v-progress-circular>
  </div>
  <v-container class="py-16" v-else>
    <div v-if="vm.isAdmin && vm.pool.address" class="mt-n8 mb-4">
      <v-btn class="mr-4" depressed rounded @click="vm.exportBuyers()" outlined>
        Export csv
      </v-btn>
      <v-btn depressed rounded @click="viewOnBsc()" outlined>
        View on BSC scan
      </v-btn>
    </div>

    <v-sheet rounded="xl" color="dark2" class="pa-4">
      <v-row>
        <v-col cols="12" md="6" sm="12" class="d-flex flex-column gap-4">
          <v-row>
            <v-col cols="12" md="2" sm="12">
              <app-logo :avatar="vm.logoUrl" class="mr-4" />
            </v-col>
            <v-col cols="12" md="8" sm="12">
              <div class="ml-1">
                <div class="text-head2">{{ vm.pool.name }}</div>
                <div>{{ vm.pool.tokenName }}</div>
              </div>
            </v-col>
          </v-row>

          <v-row class="d-flex align-center px-4 my-0">
            <v-col cols="12" md="6" sm="12">
              <div class="d-flex align-center">
                <chain-logo width="24" :chainId="vm.chainId" />
                <pool-state class="ml-2 mr-4" :state="vm.poolState" />
              </div>
            </v-col>

            <v-col
              cols="12"
              md="6"
              sm="12"
              class="d-flex align-center"
              :class="{
                'justify-end': $vuetify.breakpoint.smAndUp,
                'justify-start': $vuetify.breakpoint.xs
              }"
            >
              <div
                class="d-flex align-center"
                :class="{
                  'justify-end': $vuetify.breakpoint.smAndUp,
                  'justify-center': $vuetify.breakpoint.xs
                }"
              >
                <connect-metamask large :requiredChainId="vm.chainId" :block="$vuetify.breakpoint.xs">
                  <v-btn
                    v-if="!vm.poolState.ended"
                    depressed
                    class="gradient-btn"
                    @click="joinPool"
                    :disabled="!vm.allowSwap"
                    >{{ vm.isNotInWhitelisted ? 'You are NOT whitelisted' : 'Join Pool' }}</v-btn
                  >
                </connect-metamask>
              </div>
            </v-col>
          </v-row>

          <v-sheet rounded="lg" color="dark2" class="px-4">
            <div class="d-flex align-center justify-space-between mb-6">
              <div class="text-head4 line-clamp-1">{{ vm.pool.tokenName }}</div>
              <div v-if="vm.medium || vm.telegram || vm.telegram || vm.web">
                <div class="d-flex gap-4">
                  <a v-if="vm.medium" target="_blank" :href="vm.medium">
                    <v-img height="20px" width="20px" src="../../../assets/medium.svg" contain></v-img>
                  </a>
                  <a v-if="vm.telegram" target="_blank" :href="vm.telegram">
                    <v-img height="20px" width="20px" src="../../../assets/telegram.svg" contain></v-img>
                  </a>
                  <a v-if="vm.twitter" target="_blank" :href="vm.twitter">
                    <v-img height="20px" width="20px" src="../../../assets/twitter.svg" contain></v-img>
                  </a>
                  <a v-if="vm.web" target="_blank" :href="vm.web">
                    <v-img height="20px" width="20px" src="../../../assets/web.svg" contain></v-img>
                  </a>
                  <a v-if="vm.telegramChat" target="_blank" :href="vm.telegramChat">
                    <v-img height="20px" width="20px" src="../../../assets/telegram.svg" contain></v-img>
                  </a>
                </div>
              </div>
            </div>
            <div class="pt-0 caption flex-grow-1">
              <div
                v-line-clamp="{
                  text: vm.shortDescription,
                  lines: 3
                }"
              ></div>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="6" sm="12">
          <div class="d-flex justify-end mb-4">
            <PoolCountdown :time="vm.endDate" type="end" :callback="reloadPool" v-if="vm.onSale" />
            <PoolCountdown :time="vm.startDate" type="start" :callback="reloadPool" v-else-if="vm.showStartCountDown" />
          </div>
          <v-sheet rounded="lg" style="background: #FFFFFF1A;" class="pa-4">
            <v-row dense>
              <v-col cols="12" md="4">
                <div class="mb-2 light2--text text-body">Total tokens</div>
                <div class="text-head3" v-if="!vm.isShowTotalTokens">TBA</div>
                <div class="text-head3 address" v-else>{{ vm.totaltokens | formatNumber(0) }}</div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="mb-2 light2--text text-body">Total {{ vm.pool.tradeToken }}</div>
                <div class="text-head3">
                  {{ !vm.pool.data.totalRaiseUsd ? 'TBD' : vm.pool.data.totalRaiseUsd | round | usd }}
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="mb-2 light2--text text-body">Price</div>
                <div class="text-head3">${{ vm | _get('ratioFn', 'TBA') }}</div>
              </v-col>
            </v-row>
          </v-sheet>
          <v-sheet rounded="lg" class="mt-4 pa-4 gradient-bg">
            <div class="text-body light2--text mb-1">Progress</div>
            <div>
              <v-progress-linear height="18" rounded :value="vm.progress" color="primary" class="mb-1 rounded-pill" />
            </div>
            <div class="d-flex justify-space-between caption">
              <div class="text-body">{{ vm.progress }}%</div>
              <div class="light2--text">{{ vm.purchasedTokens | round(0) }}/{{ vm.totaltokens | round(0) }}</div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- details -->

    <v-card class="mt-6" color="transparent">
      <v-tabs v-model="tab" background-color="transparent">
        <v-tab :value="1">Project Details</v-tab>
        <v-tab :value="2">Description</v-tab>
        <v-tab :value="3">Your Allocations</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item class="py-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-sheet outlined rounded="lg" color="dark2">
                <div class="ma-4 font-weight-bold">Project</div>
                <div style="height: 1px;" class="gradient-btn"></div>
                <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Whitelist status</div>
                  <div v-if="!vm.contractAddress" class="text-body-bold text-end">TBA</div>
                  <div v-else>
                    <div class="text-body-bold text-end">
                      <span v-if="vm.isNotInWhitelisted" class="error--text">
                        You are NOT whitelisted
                      </span>
                      <span v-else class="success--text">
                        You are whitelisted
                      </span>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Start time</div>
                  <div class="text-body-bold text-end" v-if="vm.poolState.isTBAStartDate">TBA</div>
                  <div class="text-body-bold text-end" v-else>{{ vm.tokenDistribution | datetime }}</div>
                </div>
                <!-- <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Min. Allocation</div>
                  <div class="text-body-bold text-end" v-if="!vm.minAllocation">TBA</div>
                  <div class="text-body-bold text-end" v-else>
                    {{ vm.minAllocation | round | formatNumber(2) }} {{ vm.tokenName }}
                  </div>
                </div> -->
                <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Max. Allocation</div>
                  <div class="text-body-bold text-end" v-if="!vm.maxAllocation">TBA</div>
                  <div class="text-body-bold text-end" v-else>
                    {{ vm.maxAllocation | round | formatNumber(2) }} {{ vm.tokenName }}
                  </div>
                </div>
                <div style="height: 1px;" class="gradient-btn"></div>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="6">
              <v-sheet outlined rounded="lg" color="dark2">
                <div class="ma-4 font-weight-bold">Token</div>
                <div style="height: 1px;" class="gradient-btn"></div>
                <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Token name</div>
                  <div class="text-body-bold text-end">{{ vm.tokenName }}</div>
                </div>
                <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Token for sale</div>
                  <div class="text-body-bold text-end">{{ vm.totaltokens | formatNumber(2) }}</div>
                </div>
                <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Address</div>
                  <div
                    class="text-body-bold text-end"
                    :class="{
                      address: $vuetify.breakpoint.smAndDown
                    }"
                  >
                    {{ vm.tokenAddress }}
                  </div>
                </div>
                <div style="height: 1px;" class="gradient-btn"></div>

                <!-- <div class="d-flex justify-space-between align-center ma-4">
                  <div class="text-body light2--text">Participants</div>
                  <div class="text-body-bold" v-if="vm.hideParticipants">TBA</div>
                  <div class="text-body-bold text-end" v-else>{{ vm.participants }}</div>
                </div> -->
              </v-sheet>
            </v-col></v-row
          >
        </v-window-item>
        <v-window-item class="pa-6">
          {{ vm.description }}
        </v-window-item>

        <v-window-item>
          <div class="pa-4">
            <div class="d-flex gap-3 align-center">
              <div class="text-h5 font-weight-bold">Your Allocations</div>
              <connect-metamask small v-if="!walletStore.connected" />
              <div v-else>
                <PoolCountdown
                  v-if="vm.showRefundCountdown"
                  :time="vm.refundEndTime"
                  type="refund"
                  :callback="reloadPool"
                />
                <div class="ml-4">
                  <connect-metamask small :requiredChainId="vm.chainId">
                    <v-btn
                      v-if="vm.isShowRefundButton"
                      color="blue"
                      depressed
                      :loading="vm.refunding"
                      :disabled="!vm.canRefund"
                      @click="refund()"
                      outlined
                      >Refund All</v-btn
                    >
                  </connect-metamask>
                </div>
              </div>
            </div>
          </div>

          <div>
            <v-data-table
              :headers="vm.isBslHolderType ? bslheaders : headers"
              :items="vm.purchases"
              :items-per-page="-1"
              hide-default-footer
              class="dark2"
            >
              <template v-slot:item.index="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.action="{ item }">
                <div>
                  <span v-if="vm.claimAirdrop">
                    Automated Distribute
                  </span>
                  <div v-else-if="item.purchase.wasFinalized" class="d-flex align-center">
                    <span class="mr-2">Claimed</span>
                  </div>
                  <div v-else-if="item.purchase.refunded" class="d-flex align-center">
                    <span class="mr-2">Refunded</span>
                  </div>
                  <div v-else-if="vm.forceRefund">
                    <span class="mr-2">Please refund</span>
                  </div>
                  <v-btn depressed color="gradient-btn" :disabled="true" small v-else-if="!item.canRedeemTokens">
                    Claim Tokens
                  </v-btn>
                  <connect-metamask v-else small :requiredChainId="vm.chainId">
                    <v-btn
                      :loading="item.loading || vm.claiming"
                      color="gradient-btn"
                      :disabled="!item.canRedeemTokens || vm.refunding"
                      small
                      @click="item.claimToken()"
                      >Claim Tokens</v-btn
                    >
                  </connect-metamask>
                </div>
              </template>
              <template v-slot:item.purchase.validAfterDate="{ item }">
                <span v-if="item.purchase.validAfterDate && !item.isTBARedeem">
                  {{ item.purchase.validAfterDate | ddmmyyyyhhmmss }}
                </span>
                <span v-else>TBA</span>
              </template>
              <template v-slot:item.purchase.ethAmount="{ item }">
                {{ item.purchase.ethAmount | formatNumber }} {{ vm.tradeToken }}
              </template>
            </v-data-table>
          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <ido-pool-swap ref="swapDialog" @done="vm.loadPurchaseds()" />
    <refund-all-dialog ref="refund-all-dialog"></refund-all-dialog>
  </v-container>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Vue, Watch, Provide, Ref } from 'vue-property-decorator'
import { walletStore } from '@/stores/wallet-store'
import { IdoPoolDetailViewModel } from '../viewmodels/ido-pool-detail-viewmodel'
import PoolCountdown from '@/components/pool-countdown.vue'

@Observer
@Component({
  components: {
    'pool-state': () => import('../components/pool-state.vue'),
    'ido-pool-swap': () => import('./ido-pool-swap.vue'),
    'refund-all-dialog': () => import('@/modules/ido/dialogs/refund-all-dialog.vue'),
    PoolCountdown
  }
})
export default class IdoPoolDetail extends Vue {
  @Provide() vm = new IdoPoolDetailViewModel()
  @Ref('refund-all-dialog') refundAllDialog: any

  tab = null
  headers = [
    { text: '#', value: 'index', sortable: false },
    { text: 'Token Allocation', value: 'purchase.amount', sortable: false },
    { text: 'Trade Amount', value: 'purchase.ethAmount', sortable: false },
    { text: 'Date', value: 'purchase.timestamp', sortable: false },
    { text: 'Action', value: 'action', sortable: false }
  ]
  bslheaders = [
    { text: '#', value: 'index', sortable: false },
    { text: 'Token Allocation', value: 'purchase.amount', sortable: false },
    { text: 'Trade Amount', value: 'purchase.ethAmount', sortable: false },
    { text: 'Valid From', value: 'purchase.validAfterDate', sortable: false },
    { text: 'Action', value: 'action', sortable: false }
  ]
  walletStore = walletStore
  @Watch('$route.params.slugName', { immediate: true }) onPoolNameChanged(val: string) {
    if (val) {
      this.vm.loadPool(val)
    }
  }

  async refund() {
    await this.vm.getBoughtAmount()
    const confirm = await this.refundAllDialog.open(this.vm.allowRefundUsd, this.vm.purchasedBnb, this.vm.tradeToken)

    if (confirm) {
      this.vm.refund()
    }
  }

  reloadPool() {
    this.vm.loadPool(this.$route.params.slugName)
  }

  async joinPool() {
    if (this.vm.allowSwap) {
      const dialog = this.$refs.swapDialog as any
      await dialog.open()
      this.vm.loadPurchaseds()
    }
  }

  viewOnBsc() {
    window.open(`https://bscscan.com/address/${this.vm.pool?.address}`, '_blank')
  }

  destroyed() {
    this.vm.destroy()
  }
}
</script>

<style scoped lang="scss">
.intro-background {
  position: relative;
  overflow: hidden;
}
.btn-get {
  background-color: white;
}

.cover {
  background: url('../../../assets/images/cover-default.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.wave-right {
  position: absolute;
  background: url('../../../assets/images/wave-background.dark.svg') no-repeat;
  opacity: 1;
  top: -130px;
  right: -40px;
  width: 725px;
  height: 750px;
  transform: rotate(180deg);
  content: '';
  display: block;
}
.root-light {
  .wave-right {
    background: url('../../../assets/images/wave-background.light.svg');
  }
}
.address {
  overflow-wrap: break-word;
  max-width: 200px;
}
.gradient-bg {
  background: linear-gradient(90deg, rgba(250, 38, 202, 0.4) 0%, rgba(113, 42, 249, 0.4) 99.92%);
}
.tabs-bg {
  background-color: transparent !important;
}
</style>
