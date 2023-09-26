<template>
  <a target="_blank" :href="model.pool.ownerLink">
    <card-hover class="d-flex justify-center" style="min-height: 120px">
      <v-img :src="url" max-width="200" contain></v-img>
      <!-- <v-card-title class="d-flex justify-center">
        <app-avatar size="48" class="mr-4" />
        {{ model.pool.name }}
      </v-card-title>
      <v-card-text>
        <div class="d-flex justify-center">
          <v-card outlined class="px-4 py-1"> Starts: {{ model.startIn }} </v-card>
        </div>
      </v-card-text> -->
    </card-hover>
  </a>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import CardHover from '../../../components/card-hover.vue'
import { PoolStore } from '../stores/pool-store'
import poolState from './pool-state.vue'
import { fileHelpers } from '@/helpers/file-helper'
import { AppProvider } from '@/app-providers'

@Observer
@Component({ components: { poolState, CardHover } })
export default class FeaturedPoolItem extends Vue {
  @Inject() providers!: AppProvider
  @Prop({ required: true, default: null }) model!: PoolStore
  get url() {
    return fileHelpers.getApiFileUrl(this.model?.pool?.file)
  }
}
</script>

<style scoped lang="scss"></style>
