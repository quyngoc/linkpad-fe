<template>
  <v-overlay z-index="998" :value="controller.requesting">
    <v-progress-circular indeterminate size="32"></v-progress-circular>
  </v-overlay>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { loadingController } from './global-loading-controller'

@Component
export default class extends Vue {
  controller = loadingController
}
</script>

<style scoped></style>
