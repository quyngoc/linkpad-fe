<template>
  <div>
    <div class="background-1 py-16">
      <div class="fill-height text-center d-flex flex-column mx-auto px-4" style="max-width: 960px;">
        <div class="text-head2 text-md-display mb-12 mb-md-16">
          LinkPad is Bridging the Gap Between Decentralized World
        </div>

        <div v-if="vm.exclusivePools.length">
          <div style="max-width: 500px;" class="mx-auto d-flex flex-column gap-2">
            <div class="text-head4 mb-2">🔥 Exclusive Pools 🔥</div>
            <div
              v-for="poolStore in vm.exclusivePools"
              :key="poolStore.slugName"
              class="d-flex align-center gap-4 gap-md-8 cursor-pointer py-2 pa-2 card__exclusive-pool"
              style="border-bottom: 1px solid var(--v-strock-base);"
              @click="$router.push(`/project/${poolStore.pool.slugName}`)"
            >
              <app-logo :size="45" :avatar="poolStore.pool.logoUrl || poolStore.pool.file" :height="48" contain />
              <v-spacer>
                <div class="text-start line-clamp-1">
                  {{ poolStore.pool.name }}
                </div>
              </v-spacer>
              <pool-state :state="poolStore.poolState" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-container v-if="!vm.filteredPools || !vm.filteredPools.length" class="py-16">
      <div class="text-head3 font-weight-bold text-center">
        No projects currently
      </div>
    </v-container>
    <v-container v-else class="py-16">
      <v-row>
        <v-col v-if="vm.hasFeaturedPools" cols="12" class="text-head3 font-weight-bold text-center"
          >PROJECTS OPEN NOW</v-col
        >
        <v-col cols="12" sm="6" md="6" v-for="model in vm.featuredPools" :key="model.pool.id">
          <featured-pool-item :model="model" />
        </v-col>
        <v-col cols="12"></v-col>
        <v-col v-if="vm.hasUpcommings" cols="12" class="text-head3 font-weight-bold text-center"
          >PROJECTS COMING SOON</v-col
        >
        <v-col cols="12" sm="6" md="6" v-for="model in vm.upcommingsPools" :key="model.pool.id">
          <upcoming-pool-item :model="model" />
        </v-col>
        <v-col cols="12"></v-col>
        <v-col v-if="vm.hasClosedPools" cols="12" class="text-head3 font-weight-bold text-center"
          >PROJECTS CLOSED</v-col
        >
        <!-- <v-col v-if="vm.hasClosedPools" cols="6" class="text-h6 text-end">
           <v-btn to="/allPools" color="blue" outlined rounded>
            View all pools
          </v-btn> 
        </v-col> -->
        <v-col cols="12" sm="6" md="6" v-for="model in vm.slicedClosedPools" :key="model.pool.id">
          <featured-pool-item :model="model" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import FeaturedPoolItem from '../components/featured-pool-item.vue'
import UpcomingPoolItem from '../components/upcoming-pool-item.vue'
import { IdoPoolsViewModel } from '../viewmodels/ido-pools-viewmodel'
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide, Watch } from 'vue-property-decorator'

@Observer
@Component({
  components: {
    UpcomingPoolItem,
    FeaturedPoolItem,
    'pool-state': () => import('@/modules/ido/components/pool-state.vue')
  }
})
export default class IdoPools extends Vue {
  @Provide() vm = new IdoPoolsViewModel()

  @Watch('$route', { immediate: true }) onRouteChanged() {
    this.vm.loadData()
  }
}
</script>

<style scoped lang="scss">
.background-1 {
  background: var(--v-primary-lighten1);
  background-image: url('~@/assets/images/header-img-2.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}
.card__exclusive-pool {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 1);
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>
