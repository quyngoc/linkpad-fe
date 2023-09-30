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
          <v-card-title class="pt-0 pb-2 primary--text">{{ model.pool.tokenName }}</v-card-title>
          <v-spacer></v-spacer>
          <div class="mx-4 d-flex align-center mb-2">
            <pool-state :state="model.poolState" />
          </div>
        </div>
        <v-card-title v-if="model.shortDescription" class="pt-0 caption flex-grow-1 description">
          <div
            v-line-clamp="{
              text: model.shortDescription,
              lines: 3
            }"
          ></div>
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div>
              <div class="caption">Total raise</div>
              <div class="text-h6">
                {{ !model.totalRaiseUsd ? 'TBD' : model.totalRaiseUsd | round | usd }}
              </div>
            </div>
            <div>
              <div class="caption">Price</div>
              <div class="text-h6">${{ model.ratioFn | round }}</div>
            </div>
            <div>
              <div class="caption">Access</div>
              <div class="text-h6">{{ model.pool.accessType }}</div>
            </div>
          </div>
          <div>
            <div class="d-flex align-center pt-4">
              <div class="caption">Progress</div>
            </div>
            <div>
              <v-progress-linear height="12" rounded />
            </div>
            <div class="d-flex justify-space-between caption">
              <div class="caption">0 %</div>
              <div class="caption">0 / 0</div>
            </div>
          </div>
        </v-card-text>
      </card-hover>
    </router-link>
    <!-- <v-divider class="mx-4"></v-divider> -->
    <!-- <v-card-text>
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex flex-column">
            <span class="text-subtitle-1">Total Raise</span>
            <span class="text-h6 primary--text">{{
              !model.totalRaiseUsd ? 'TBD' : model.totalRaiseUsd | round | usd
            }}</span>
          </div>
          <v-spacer />
          <v-btn :disabled="!model.whitelistUrl" color="primary" rounded :href="model.whitelistUrl" target="_blank"
            >Join Whitelist</v-btn
          >
        </div>
      </v-card-text> -->
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
  showMore = false

  @Prop({ required: true, default: null }) model!: PoolStore

  mounted() {
    this.model.loadDataIfNeed()
  }

  clickOnCard() {
    if (this.model.web) {
      window.open(this.model.web)
    }
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

  get coverImage() {
    return this.model.pool.coverImageUrl ? this.model.pool.coverImageUrl : require('@/assets/images/cover-default.jpg')
  }
}
</script>

<style scoped lang="scss">
::v-deep .v-responsive {
  overflow: initial;
}
.bg-color {
  background-color: #2a2342;
}
.description {
  min-height: 90px;
  word-break: normal;
}
</style>
