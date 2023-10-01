<template>
  <div class="fill-height py-16">
    <v-container>
      <div class="text-h5 font-weight-bold">Your Allocations</div>

      <v-sheet
        v-if="!vm.allPools.length && !vm.loading"
        color="dark2"
        height="300"
        rounded="lg"
        class="d-flex flex-column justify-center align-center mt-6"
      >
        <div class="text-head3 mb-3">No allocation in any pool yet!</div>
        <div class="text-sub light2--text mb-6">Refer to some projects on LINKPAD</div>
        <v-btn color="blue" outlined rounded to="/projects">Linkpad-projects</v-btn>
      </v-sheet>

      <v-card v-for="pool in vm.allPools" :key="pool.model.id" class="mt-6 pa-6" rounded="xl" color="dark2">
        <div class="mb-6 d-flex align-center gap-4">
          <div style="min-width: 50px">
            <app-logo :size="48" :avatar="pool.model.logoUrl || pool.model.file" />
          </div>
          <div class="text-subtitle-2">{{ pool.model.name }}</div>
          <PoolCountdown v-if="pool.showRefundCountdown" :time="pool.refundEndTime" type="refund" />
          <div v-if="pool.isShowRefundButton" class="ml-4">
            <connect-metamask small :requiredChainId="pool.chainId">
              <v-btn
                color="blue"
                depressed
                rounded
                :loading="pool.refunding"
                :disabled="!pool.canRefund || vm.tokenClaiming"
                @click="refund(pool)"
                outlined
                >Refund All</v-btn
              >
            </connect-metamask>
          </div>
          <v-spacer></v-spacer>
        </div>
        <v-card flat style="border-radius: 16px; border: 1px solid var(--v-strock-base);">
          <v-data-table
            :headers="pool.isBslHolderType ? bslheaders : headers"
            :items="pool.purchases"
            :items-per-page="-1"
            hide-default-footer
            class="dark2"
            :loading="pool.loading"
          >
            <template v-slot:item.index="{ index }">
              {{ index + 1 }}
            </template>
            <template v-slot:item.action="{ item }">
              <div>
                <span v-if="pool.claimAirdrop">
                  Automated Distribute
                </span>
                <div v-else-if="item.claimed" class="d-flex align-center">
                  <span class="mr-2">Claimed</span>
                </div>
                <div v-else-if="item.refunded" class="d-flex align-center">
                  <span class="mr-2">Refunded</span>
                </div>
                <div v-else-if="pool.forceRefund">
                  Please refund
                </div>
                <v-btn depressed rounded color="gradient-btn" :disabled="true" small v-else-if="!item.canRedeemTokens">
                  Claim Tokens
                </v-btn>
                <connect-metamask small v-else :requiredChainId="pool.chainId">
                  <v-btn
                    depressed
                    rounded
                    color="gradient-btn"
                    :disabled="!item.canRedeemTokens || pool.isTBARedeem || pool.refunding"
                    :loading="item.claiming || vm.tokenClaiming"
                    small
                    @click="claimToken(pool, item)"
                    >Claim Tokens</v-btn
                  >
                </connect-metamask>
              </div>
            </template>
            <template v-slot:item.purchase.validAfterDate="{ item }">
              <span v-if="item.purchase.validAfterDate && !pool.isTBARedeem">
                {{ item.purchase.validAfterDate | ddmmyyyyhhmmss }}
              </span>
              <span v-else>TBA</span>
            </template>
            <template v-slot:item.purchase.ethAmount="{ item }">
              {{ item.purchase.ethAmount | formatNumber }} {{ pool.tradeToken }}
            </template>
          </v-data-table>
        </v-card>
      </v-card>
      <div class="d-flex mt-6 justify-center">
        <v-btn v-if="!walletStore.connected" depressed rounded color="gradient-btn" @click="walletStore.connect()">
          Connect Wallet
        </v-btn>
        <v-btn
          v-else-if="vm.canLoadMore"
          depressed
          rounded
          color="gradient-btn"
          :loading="vm.loading"
          @click="vm.fetchPools()"
        >
          Load More
          <template v-slot:loader>
            <span>Loading...</span>
          </template>
        </v-btn>
      </div>
    </v-container>
    <RefundAllDialog ref="RefundAllDialog"></RefundAllDialog>
  </div>
</template>

<script lang="ts">
import FeaturedPoolItem from '../components/featured-pool-item.vue'
import UpcomingPoolItem from '../components/upcoming-pool-item.vue'
import UpcomingProjectItem from '../components/upcoming-project-item.vue'
import { AllAllocationsViewModel } from '../viewmodels/all-allocations-viewmodel'
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide, Ref } from 'vue-property-decorator'
import poolState from '@/modules/ido/components/pool-state.vue'
import { walletStore } from '@/stores/wallet-store'
import PoolCountdown from '@/components/pool-countdown.vue'
import RefundAllDialog from '@/modules/ido/dialogs/refund-all-dialog.vue'
import { snackController } from '@/components/snack-bar/snack-bar-controller'

@Observer
@Component({
  components: {
    UpcomingPoolItem,
    FeaturedPoolItem,
    UpcomingProjectItem,
    poolState,
    PoolCountdown,
    RefundAllDialog
  }
})
export default class AllPools extends Vue {
  @Provide() vm = new AllAllocationsViewModel()
  @Ref('RefundAllDialog') refundAllDialog: any

  walletStore = walletStore
  searchKey = ''
  headers = [
    { text: '#', value: 'index', sortable: false },
    { text: 'Token Allocation', value: 'purchase.amount', sortable: false },
    { text: 'USDT Amount', value: 'purchase.ethAmount', sortable: false },
    { text: 'Date', value: 'purchase.timestamp', sortable: false },
    { text: 'Action', value: 'action', sortable: false }
  ]
  bslheaders = [
    { text: '#', value: 'index', sortable: false },
    { text: 'Token Allocation', value: 'purchase.amount', sortable: false },
    { text: 'USDT Amount', value: 'purchase.ethAmount', sortable: false },
    { text: 'Date', value: 'purchase.validAfterDate', sortable: false },
    { text: 'Action', value: 'action', sortable: false }
  ]

  async refund(pool) {
    await pool.getBoughtAmount()
    const confirm = await this.refundAllDialog.open(pool.allowRefundUsd, pool.purchasedBnb, pool.tradeToken)
    if (confirm) {
      pool.refund()
    }
  }

  showDetail(item) {
    if (item.pool.address) {
      this.$router.push({ path: '/project/' + item.pool.id })
    }
  }

  async claimToken(pool, item) {
    try {
      this.vm.setClaiming(true)
      await item.claimToken()
      pool.loadDetailPurchases()
    } catch (error) {
      snackController.commonError(error)
    } finally {
      this.vm.setClaiming(false)
    }
  }

  destroyed() {
    this.vm.destroy()
  }
}
</script>

<style scoped lang="scss">
::v-deep tr:not(:last-child) td {
  border-bottom: thin solid var(--v-strock-base) !important;
}

::v-deep th {
  border-bottom: thin solid var(--v-strock-base) !important;
}
.progress-mobile {
  width: 120px;
}
.progress-desktop {
  width: 200px;
}
</style>
