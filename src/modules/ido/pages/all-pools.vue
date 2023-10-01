<template>
  <div class="fill-height">
    <v-container class="pa-6">
      <div class="text-h5 font-weight-bold mb-4">All Pools</div>

      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-text-field
            style="border: 1px solid var(--v-strock-base);"
            hide-details
            flat
            solo
            v-model="searchKey"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search by Pool name, Token address, Token sympol"
            class="input"
            background-color="dark2"
            @keyup.enter="vm.fetchPools(1, searchKey)"
          />
        </v-col>
      </v-row>
      <v-card class="mt-8" rounded="lg" style="border: 1px solid var(--v-strock-base);">
        <v-data-table
          :server-items-length="vm.totalCount"
          @update:page="vm.fetchPools($event)"
          :footer-props="{ itemsPerPageOptions: [10] }"
          :items="vm.allPools"
          :headers="headers"
          @click:row="showDetail"
          :loading="vm.loading"
          class="dark2"
        >
          <template v-slot:[`item.ratio`]="{ item }">
            <div>
              <div v-if="!item.contract">
                TBA
              </div>
              <div v-else>1 {{ item.tradeToken }} = {{ item.token2TradeToken }} {{ item.pool.tokenName }}</div>
            </div>
          </template>
          <template v-slot:[`item.progress`]="{ item }">
            <div
              class="d-flex align-center"
              :class="{
                'progress-desktop': $vuetify.breakpoint.mdAndUp,
                'progress-mobile': $vuetify.breakpoint.smAndDown
              }"
            >
              <div style="white-space: nowrap; width: 50px">{{ item.progress | round(2) }}%</div>
              <v-progress-linear class="ml-2" height="12" rounded :value="item.progress" />
            </div>
          </template>
          <template v-slot:[`item.poolState`]="{ item }">
            <div class="d-flex align-center">
              <pool-state :state="item.poolState" />
            </div>
          </template>
        </v-data-table>
      </v-card>
      <div class="d-flex"></div>
    </v-container>
    <v-divider class="mt-7" />
    <!-- <company-footer /> -->
  </div>
</template>

<script>
import FeaturedPoolItem from '../components/featured-pool-item.vue'
import UpcomingPoolItem from '../components/upcoming-pool-item.vue'
import UpcomingProjectItem from '../components/upcoming-project-item.vue'
import { AllPoolsViewModel } from '../viewmodels/all-pools-viewmodel'
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide } from 'vue-property-decorator'
import poolState from '@/modules/ido/components/pool-state.vue'

@Observer
@Component({
  components: {
    UpcomingPoolItem,
    FeaturedPoolItem,
    UpcomingProjectItem,
    poolState
  }
})
export default class AllPools extends Vue {
  @Provide() vm = new AllPoolsViewModel()

  searchKey = ''
  headers = [
    { text: 'Pool Name', value: 'pool.name', sortable: false },
    { text: 'Ratio', value: 'ratio', sortable: false },
    { text: 'Access', value: 'pool.accessType', sortable: false },
    { text: 'Progress', value: 'progress', sortable: false },
    { text: 'Status', value: 'poolState', sortable: false, align: 'start' }
  ]

  showDetail(item) {
    this.$router.push({ path: '/project/' + item.pool.slugName })
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
