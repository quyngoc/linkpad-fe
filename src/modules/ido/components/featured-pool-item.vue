<template>
  <router-link :to="`/pool/${model.pool.slugName}`">
    <card-hover style="overflow: hidden">
      <v-img :src="coverImage" height="248" content-class="position-relative">
        <div class="pt-6 pr-6 d-flex align-center justify-end gap-2">
          <pool-state :state="model.poolState" />
        </div>
        <div style="bottom: -40px; left: 20px;" class="position-absolute">
          <app-logo :avatar="model.pool.logoUrl || model.pool.file" :height="48" contain />
        </div>
      </v-img>
      <div class="pa-6 pt-14 d-flex flex-column gap-2">
        <div>
          <div class="text-head2 line-clamp-1 mb-1">{{ model.pool.name }}</div>
          <div class="text-head4">{{ model.pool.tokenName }} / {{ model.tradeToken }}</div>
        </div>
        <v-sheet style="height: 1px" color="#202020"></v-sheet>
        <div class="d-flex flex-column gap-1">
          <div class="d-flex justify-space-between align-center">
            <div class="text-cap light2--text mb-1">Total Raise</div>
            <div class="text-head4 blue--text">
              {{ !model.totalRaiseUsd ? 'TBD' : model.totalRaiseUsd | round | usd }}
            </div>
          </div>
          <div class="d-flex justify-space-between align-center">
            <div class="text-cap light2--text mb-1">Price ratio</div>
            <div class="text-body-bold">1 {{ model.pool.tokenName }} = ${{ model.ratioFn }}</div>
          </div>
          <div class="d-flex justify-space-between align-center">
            <div class="text-cap light2--text mb-1">Access</div>
            <div class="text-body-bold">{{ model.pool.accessType }}</div>
          </div>
        </div>
        <div>
          <div style="font-size: 14px;" class="light2--text mb-1">Progress</div>
          <div>
            <v-progress-linear height="12" rounded :value="model.progress" color="blue" class="mb-1 rounded-pill" />
          </div>
          <div class="d-flex justify-space-between caption">
            <div class="text-body">{{ model.progress }}%</div>
            <div class="light2--text">{{ model.purchasedTokens | round(0) }}/{{ model.totaltokens | round(0) }}</div>
          </div>
        </div>
      </div>
    </card-hover>
  </router-link>
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
  coverImage = require('@/assets/images/cover-default.jpg')

  mounted() {
    this.coverImage = this.model.pool.coverImageUrl || this.coverImage
    this.model.loadDataIfNeed()
  }
}
</script>
<style scoped lang="scss">
::v-deep .v-responsive {
  overflow: initial;
}
</style>
