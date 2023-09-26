<template>
  <div class="text-head4">{{ vm.tokenName }}</div>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Inject, Vue } from 'vue-property-decorator'
import { IdoPoolSwapViewModel } from '../viewmodels/ido-pool-swap-viewmodel'

@Observer
@Component
export default class extends Vue {
  @Inject() vm!: IdoPoolSwapViewModel
}
</script>

<style scoped></style>
