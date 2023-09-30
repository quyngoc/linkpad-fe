<template>
  <!-- <router-link :to="`/project/${model.pool.slugName}`"> -->
  <v-card class="d-flex flex-column full-height bg-color" rounded="lg" outlined>
    <div class="d-flex full-width pa-4 align-center">
      <app-logo :avatar="model.pool.logoUrl || model.pool.file" :height="48" contain />
      <div class="ml-3">
        <div class="py-0">{{ model.pool.name }}</div>
        <div v-if="isSocial" class="py-0">
          <div class="d-flex">
            <a v-if="model.medium" target="_blank" :href="model.medium">
              <v-img class="mr-3" height="20px" width="20px" src="../../../assets/medium.svg" contain></v-img>
            </a>
            <a v-if="model.telegram" target="_blank" :href="model.telegram">
              <v-img class="mr-3" height="20px" width="20px" src="../../../assets/telegram.svg" contain></v-img>
            </a>
            <a v-if="model.telegramChat" target="_blank" :href="model.telegramChat">
              <v-img class="mr-3" height="20px" width="20px" src="../../../assets/telegram.svg" contain></v-img>
            </a>
            <a v-if="model.twitter" target="_blank" :href="model.twitter">
              <v-img class="mr-3" height="20px" width="20px" src="../../../assets/twitter.svg" contain></v-img>
            </a>
            <a v-if="model.web" target="_blank" :href="model.web">
              <v-img class="mr-3" height="20px" width="20px" src="../../../assets/web.svg" contain></v-img>
            </a>
          </div>
        </div>
      </div>
    </div>
    <v-divider class="mb-0"></v-divider>
    <router-link :to="`/project/${model.pool.slugName}`">
      <card-hover>
        <div class="d-flex full-width align-center">
          <div class="mx-4 primary--text">{{ model.pool.tokenName }}</div>
          <v-spacer></v-spacer>
          <v-card-title class="my-1 py-0">
            <pool-state :state="model.poolState" />
            <chain-logo width="24" :chainId="model.chainId" class="ml-2" />
          </v-card-title>
        </div>
        <v-spacer></v-spacer>
        <v-card-title v-if="model.shortDescription" class="pt-0 caption flex-grow-1 description">
          <div
            v-line-clamp="{
              text: model.shortDescription,
              lines: 3
            }"
          ></div>
        </v-card-title>
        <v-card-subtitle class="my-1 py-0"
          >Swap rate 1 {{ model.tradeToken }} = {{ model.token2TradeToken | round }}
          {{ ' ' + model.pool.tokenName }}</v-card-subtitle
        >
        <v-card-subtitle class="pt-3 pb-0">Progress</v-card-subtitle>
        <div class="mx-4">
          <v-progress-linear height="12" rounded :value="model.progress" />
        </div>
        <div class="mx-4 d-flex justify-space-between caption">
          <div>
            {{ model.progress + ' %' }}
          </div>
          <div class="success--text">{{ model.purchasedTokens | round(0) }} / {{ model.totaltokens | round(0) }}</div>
        </div>
        <v-divider class="mx-4 mt-4"></v-divider>
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div>
              <div class="caption">Access</div>
              <div class="text-h6">{{ model.pool.accessType }}</div>
            </div>
            <div>
              <div class="caption">Max {{ model.tradeToken }}</div>
              <div class="text-h6">{{ model.maxPurchaseBnb4Display | round(5) }}</div>
            </div>
            <div>
              <div class="caption">Participants</div>
              <div v-if="model.hideParticipants" class="text-h6">TBA</div>
              <div v-else class="text-h6">{{ model.participants }}</div>
            </div>
          </div>
        </v-card-text>
      </card-hover>
    </router-link>
  </v-card>
  <!-- </router-link> -->
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Prop, Vue } from 'vue-property-decorator'
import CardHover from '../../../components/card-hover.vue'
import { PoolStore } from '../stores/pool-store'
import poolState from './pool-state.vue'

@Observer
@Component({ components: { poolState, CardHover } })
export default class FeaturedPoolItem extends Vue {
  @Prop({ required: true, default: null }) model!: PoolStore

  mounted() {
    this.model.loadDataIfNeed()
  }

  isSocial() {
    return (
      this.model.medium ||
      this.model.telegram ||
      this.model.web ||
      this.model.facebook ||
      this.model.instagram ||
      this.model.discord ||
      this.model.reddit ||
      this.model.telegramChat ||
      this.model.twitter ||
      this.model.github ||
      this.model.youtube
    )
  }
}
</script>
<style scoped lang="scss">
.bg-color {
  background-color: #2a2342;
}
.description {
  min-height: 90px;
  word-break: normal;
}
</style>
