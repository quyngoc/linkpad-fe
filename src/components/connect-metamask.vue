<template>
  <v-btn
    v-if="!walletStore.connected"
    depressed
    :large="large"
    color="gradient-btn"
    :block="block"
    @click="walletStore.connect()"
  >
    Connect Wallet
  </v-btn>
  <v-btn
    depressed
    :large="large"
    color="gradient-btn"
    :block="block"
    :small="small"
    v-else-if="walletStore.chainId !== +requiredChainId"
    @click="walletStore.switchNetwork(+requiredChainId)"
  >
    Switch to {{ networkName }}
  </v-btn>
  <div v-else>
    <slot />
  </div>
</template>

<script lang="ts">
import { blockchainHandler } from '@/blockchain'
import { walletStore } from '@/stores/wallet-store'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class ConnectMetamask extends Vue {
  @Prop() requiredChainId!: string
  @Prop({ default: false }) block!: boolean
  @Prop({ default: false }) large!: boolean
  @Prop({ default: false }) small!: boolean

  walletStore = walletStore

  get networkName() {
    const { name } = blockchainHandler.getChainConfig(this.requiredChainId)
    return name
  }
}
</script>

<style scoped></style>
