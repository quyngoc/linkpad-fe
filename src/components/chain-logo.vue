<template>
  <img :src="require(`@/assets/icons/${chain || 'bsc'}-icon.png`)" v-bind="$attrs" />
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Observer
@Component
export default class ChainLogo extends Vue {
  @Prop({ default: 56 }) chainId!: 1 | 3 | 56 | 97 | 205 | 4002

  get chain() {
    switch (this.chainId) {
      case 1:
      case 3:
        return 'eth'
      case 205:
      case 4002:
        return 'sol'
      case 56:
      case 97:
      default:
        return 'bsc'
    }
  }
}
</script>

<style scoped></style>
