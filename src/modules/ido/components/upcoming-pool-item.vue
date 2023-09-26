<template>
  <router-link :to="`/pool/${model.pool.slugName}`">
    <card-hover style="overflow: hidden">
      <v-img :src="coverImage" height="248" content-class="position-relative">
        <div class="pt-6 pr-6 d-flex align-center justify-end gap-2">
          <pool-state :state="model.poolState" />
          <div>🔥</div>
        </div>
        <div style="bottom: -40px; left: 20px;" class="position-absolute">
          <app-logo :avatar="model.pool.logoUrl || model.pool.file" :height="48" contain />
        </div>
      </v-img>

      <div class="pa-6 pt-14 d-flex flex-column gap-5">
        <div>
          <div class="text-head2 line-clamp-1">{{ model.pool.name }}</div>
          <div class="text-head4 line-clamp-1">{{ model.pool.tokenName }}</div>
          <div class="text-cap light2--text line-clamp-3 mt-2" style="height: 42px">
            {{ model.shortDescription }}
          </div>
        </div>
        <div>
          <v-row>
            <v-col cols="4">
              <div class="text-cap light2--text mb-1">Min Allocation</div>
              <div class="text-head4">{{ model.minAllocationUsd | round | usd }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-cap light2--text mb-1">Max. Allocation</div>
              <div class="text-head4">{{ model.maxAllocationUsd | round | usd }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-cap light2--text mb-1">Access</div>
              <div class="text-head4">{{ model.pool.accessType }}</div>
            </v-col>
          </v-row>
        </div>

        <v-sheet style="height: 1px" color="#202020"></v-sheet>

        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-cap light2--text mb-1">Total Raised</div>
            <div class="text-head2 blue--text">
              {{ !model.totalRaiseUsd ? 'TBD' : model.totalRaiseUsd | round | usd }}
            </div>
          </div>
          <!-- <v-btn
            depressed
            rounded
            class="gradient-btn"
            :disabled="!model.whitelistUrl"
            :href="model.whitelistUrl"
            target="_blank"
            >Join Whitelist</v-btn
          > -->
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

  get coverImage() {
    return this.model.pool.coverImageUrl ? this.model.pool.coverImageUrl : require('@/assets/images/cover-default.jpg')
  }
}
</script>

<style scoped lang="scss">
::v-deep .v-responsive {
  overflow: initial;
}
</style>
