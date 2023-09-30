<template>
  <v-dialog v-model="vm.showHavestDialog" persistent retain-focus max-width="400">
    <v-card color="dark2" rounded="lg" class="pa-6">
      <div class="d-flex flex-column gap-24 text-subtitle-2 font-weight-regular">
        <div class="d-flex flex-column gap-8 text-center">
          <div>Do you want to havest the full reward?</div>
          <div>
            <span>Amount: </span
            ><span class="orange--text font-weight-600"> {{ vm.pendingReward | formatNumber(6) }} LINKPAD</span>
          </div>
        </div>

        <v-row>
          <v-col>
            <v-btn
              class="border-radius-8 text-none btn-text px-4 py-5"
              block
              outlined
              :disabled="vm.havesting"
              @click="vm.setShowHavestDialog(false)"
            >
              <span>Cancel</span>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              :loading="vm.havesting"
              @click="vm.havest()"
              class="border-radius-8 text-none btn-text px-4 py-5"
              color="gradient-btn"
              block
            >
              Harvest
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Inject, Vue } from 'vue-property-decorator'
import { StakingViewModel } from '../viewmodels/staking-viewmodel'

@Observer
@Component
export default class HavestDialog extends Vue {
  @Inject() vm!: StakingViewModel
}
</script>

<style scoped>
.gap-24 {
  gap: 24px;
}

.gap-8 {
  gap: 8px;
}
</style>
