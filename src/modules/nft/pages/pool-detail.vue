<template>
  <div v-if="vm.poolData && vm.poolData.id">
    <div class="primary lighten-1">
      <v-container>
        <v-row no-gutters class="box-card mt-8 align-center pa-3">
          <v-col md="4" sm="12" class="pa-3">
            <div>
              <v-img
                :src="require(`@/assets/nfts/${vm.poolData.id}/${vm.poolData.coverUrl}`)"
                style="border-radius: 16px"
              ></v-img>
            </div>
          </v-col>
          <v-col md="8" sm="12" class="pa-3">
            <div class="d-flex align-center">
              <div class="text-h5 font-weight-bold mr-2">{{ vm.poolData.name }}</div>
              <div class="mr-2 text-h5 font-weight-bold">{{ vm.poolData.symbol }}</div>
              <v-img :src="require(`@/assets/nfts/${vm.poolData.id}/${vm.poolData.nftIcon}`)" max-width="28px"></v-img>
            </div>
            <div class="mt-4">
              {{ vm.poolData.description }}
            </div>
            <div class="d-flex mt-5">
              <div class="d-flex flex-column mr-10">
                <div>Total raise</div>
                <div class="text-h6">{{ vm.poolData.totalRaise }}</div>
              </div>
              <div class="d-flex flex-column">
                <div>Sale amount</div>
                <div class="text-h6">{{ vm.poolData.saleAmount }} NFTs</div>
              </div>
            </div>
            <div class="mt-5">
              <div v-if="vm.poolStatus === 'onSale'">
                <div class="mb-2">The sale END in:</div>
                <PoolCountdown :time="vm.poolData.endDate" type="end" :callback="reloadPool" />
              </div>
              <div v-else-if="vm.poolStatus === 'upcoming'">
                <div>The sale OPEN in:</div>
                <PoolCountdown :time="vm.poolData.startDate" type="start" :callback="reloadPool" />
              </div>
              <div v-else class="ended-box d-flex justify-center align-center">The sale is ended</div>
            </div>
          </v-col>
        </v-row>
        <v-row class="mt-8">
          <v-col v-for="(item, index) in vm.poolData.items" :key="index" md="4" sm="12">
            <div class="box-card">
              <v-img :src="require(`@/assets/nfts/${vm.poolData.id}/${item.coverUrl}`)"></v-img>
              <div class="pa-6">
                <div class="d-flex justify-center text-h6">{{ item.name }}</div>
                <v-divider class="my-3"></v-divider>
                <!-- <div class="d-flex justify-space-between mt-4">
                  <div>Box raise:</div>
                  <div>{{ (item.nftForSale * item.price) | formatNumber(0) }} {{ item.tradeTokenSymbol }}</div>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <div>Box amount:</div>
                  <div>{{ item.nftForSale | formatNumber(0) }} boxes</div>
                </div> -->
                <div class="text--secondary">{{ item.description }}</div>
                <div class="d-flex justify-space-between mt-2">
                  <div>Price per box:</div>
                  <div>{{ item.price }} {{ item.tradeTokenSymbol }}</div>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <div>Box amount:</div>
                  <div>{{ item.nftForSale | formatNumber(0) }} boxes</div>
                </div>
                <!-- <div class="d-flex justify-space-between mt-2">
                  <div>Personal allocation:</div>
                  <div>{{ item.maxUserNft | formatNumber(0) }} boxes</div>
                </div> -->
                <div v-if="vm.poolStatus === 'onSale'">
                  <div v-if="vm.poolData.isShowProgress">
                    <div class="d-flex justify-space-between mt-4">
                      <div class="text-caption">{{ item.progress | formatNumber(0) }}%</div>
                      <div class="text-caption progress-text">{{ item.boughtNft }}/ {{ item.nftForSale }}</div>
                    </div>
                    <div class="mt-1">
                      <v-progress-linear height="12" :value="item.progress" rounded></v-progress-linear>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div v-if="walletStore.connected && walletStore.chainId === vm.CHAIN_ID">
                      <v-btn v-if="item.soldOut" disabled color="grey" block>SOLD OUT</v-btn>
                      <v-btn v-else color="primary" block @click="vm.openBuyBoxDialog(item.id)">BUY BOX</v-btn>
                    </div>
                    <connect-metamask v-else block :requiredChainId="vm.CHAIN_ID" />
                  </div>
                  <v-divider class="my-4"></v-divider>
                  <div class="d-flex justify-space-between">
                    <div>Your purchased:</div>
                    <div>{{ item.purchased }} box(es)</div>
                  </div>
                </div>
                <div v-if="vm.poolStatus === 'ended'">
                  <div v-if="vm.poolData.isShowProgress">
                    <div class="d-flex justify-space-between mt-4">
                      <div class="text-caption">{{ item.progress | formatNumber(0) }}%</div>
                      <div class="text-caption progress-text">{{ item.boughtNft }}/ {{ item.nftForSale }}</div>
                    </div>
                    <div class="mt-1">
                      <v-progress-linear height="12" :value="item.progress" rounded></v-progress-linear>
                    </div>
                  </div>
                  <v-divider class="my-4"></v-divider>
                  <div class="d-flex justify-space-between">
                    <div>Your purchased:</div>
                    <div>{{ item.purchased }} box(es)</div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- <div class="my-8">
            <div class="text-h6 font-weigth-bold">About Project</div>
            <div>
              <ProjectDescription></ProjectDescription>
            </div>
          </div> -->
        </v-row>

        <!-- guideline -->
        <div v-if="$vuetify.breakpoint.mdAndUp">
          <div v-if="vm.poolData.openBoxText" class="pa-4 box-card my-8 text-center text-h6 font-weight-bold">
            {{ vm.poolData.openBoxText }}
          </div>
          <div v-if="vm.poolData.guidelineSteps && vm.poolData.guidelineSteps.length">
            <span class="text-h6 font-weight-bold">How to open the box</span>
            <div class="d-flex justify-space-between">
              <div class="d-flex align-center" v-for="(stepContent, index) in vm.poolData.guidelineSteps" :key="index">
                <v-card max-width="400" height="100%" class="box-card px-4">
                  <v-row class="my-auto align-center full-height">
                    <v-col class="text-h4 font-weight-bold" cols="2"> {{ index + 1 }} </v-col>
                    <v-col cols="10">
                      <div v-html="stepContent"></div>
                    </v-col>
                  </v-row>
                </v-card>
                <div v-if="index < vm.poolData.guidelineSteps.length - 1">
                  <v-icon class="mx-2" dark>
                    mdi-arrow-right
                  </v-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="vm.poolData.openBoxText" class="pa-4 box-card my-8 text-center text-h6 font-weight-bold">
            {{ vm.poolData.openBoxText }}
          </div>
          <div v-if="vm.poolData.guidelineSteps && vm.poolData.guidelineSteps.length">
            <span class="text-h6 font-weight-bold">How to open the box</span>
            <div class="d-flex flex-column justify-space-between">
              <div
                class="d-flex flex-column align-center"
                v-for="(stepContent, index) in vm.poolData.guidelineSteps"
                :key="index"
              >
                <v-card height="100%" class="box-card px-4 full-width">
                  <v-row class="my-auto align-center full-height">
                    <v-col class="text-h4 font-weight-bold" cols="2"> {{ index + 1 }} </v-col>
                    <v-col cols="10">
                      <div v-html="stepContent"></div>
                    </v-col>
                  </v-row>
                </v-card>
                <div v-if="index < vm.poolData.guidelineSteps.length - 1">
                  <v-icon class="mx-2" dark>
                    mdi-arrow-down
                  </v-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </div>

    <BuyDialog />
    <!-- <company-footer /> -->
  </div>
  <div v-else>
    <v-skeleton-loader class="ma-16" type="card, table-tfoot, card-heading, image"></v-skeleton-loader>
  </div>
</template>

<script>
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide } from 'vue-property-decorator'
import BuyDialog from '../components/buy-dialog.vue'
import ProjectDescription from '../components/project-description.vue'
import { PoolDetailViewModel } from '../viewmodels/pool-detail-viewmodel'
import PoolCountdown from '@/components/pool-countdown.vue'
import { walletStore } from '@/stores/wallet-store'

@Observer
@Component({
  components: {
    BuyDialog,
    ProjectDescription,
    PoolCountdown
  }
})
export default class PoolDetail extends Vue {
  @Provide() vm = new PoolDetailViewModel()
  walletStore = walletStore

  reloadPool() {
    this.vm.loadPool(this.$route.params.id)
  }
}
</script>

<style scoped lang="scss">
.box-card {
  background: #202020;
  border-radius: 16px;
}

.ended-box {
  border: 1px solid #656565;
  padding: 16px;
  max-width: 250px;
}

.progress-text {
  color: #656565;
}
</style>
