<template>
  <div>
    <v-card elevation="0" class="card pa-6 mx-auto mt-16">
      <div class="text-h6">
        Setting SOLANA wallet
      </div>
      <v-card class="card pa-2 mt-6" outlined>
        <v-card-text class="font-italic">
          <div>
            - Please
            <span class="font-weight-bold">
              fill out exactly your Solana wallet
            </span>
            . In
            <span class="font-weight-bold">
              the Solana projects
            </span>
            , LINKPAD will distribute directly to investors by this Solana wallet.
          </div>
          <div>
            - Your Solana wallet can be changed for any project by yourself. Only one wallet can be used per project and
            can not be changed.
          </div>
          <div>
            - Remember, this is important information that affects your interests. So always be sure with the
            information you fill in.
            <span class="font-weight-bold">
              In case of errors on your part, You will be fully responsible for those errors.</span
            >
          </div>
        </v-card-text>
      </v-card>
      <div class="mt-6 mb-2">
        <div v-if="walletStore.connected && walletStore.chainId === vm.CHAIN_ID">
          <div class="mb-2">
            Your Solana wallet address
          </div>
          <div v-if="vm.solanaAddress && !vm.isUpdate">
            <v-row>
              <v-col cols="12">
                <v-text-field :value="vm.solanaAddress" hide-details outlined solo rounded disabled>
                  <div slot="append" class="px-2">
                    <chain-logo width="24" :chainId="205" />
                  </div>
                </v-text-field>
              </v-col>

              <v-col cols="3"></v-col>
              <v-col cols="6">
                <v-btn depressed color="primary" block large outlined @click="vm.changeWallet(true)"
                  >Change wallet</v-btn
                >
              </v-col>
              <v-col cols="3"></v-col>
            </v-row>
          </div>
          <div v-else-if="!vm.solanaAddress || vm.isUpdate">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="address"
                  hide-details
                  outlined
                  solo
                  rounded
                  :disabled="vm.showConfirm"
                  placeholder="Input your Solana Address"
                  @keyup.enter="vm.submit(address)"
                >
                  <div slot="append" class="px-2">
                    <chain-logo width="24" :chainId="205" />
                  </div>
                </v-text-field>
              </v-col>
            </v-row>

            <div>
              <div v-if="walletStore.connected && walletStore.chainId === vm.CHAIN_ID">
                <div v-if="!vm.showConfirm" class="mt-6 d-flex">
                  <v-btn depressed large outlined class="px-5" v-if="vm.isUpdate" @click="vm.changeWallet(false)"
                    >Cancel</v-btn
                  >
                  <v-spacer></v-spacer>
                  <v-btn depressed color="primary" large outlined class="px-5" @click="vm.submit(address)"
                    >Submit</v-btn
                  >
                </div>

                <v-card v-else class="card pa-6 mx-auto mt-6" outlined>
                  <div class="text--secondary font-italic text-center">
                    You will use this wallet for the current Solana project on and cannot be changed. If you change the
                    wallet later, the new wallet will be used for the next project!
                  </div>
                  <div class="text-center mt-4" style="font-size: 18px">
                    {{ address }}
                  </div>
                  <div class="mt-6 text-center">
                    <v-btn depressed large outlined @click="vm.cancelConfirm" :disabled="vm.isSetting" class="px-5 mx-4"
                      >Cancel</v-btn
                    >
                    <v-btn
                      depressed
                      color="primary"
                      large
                      outlined
                      class="px-5 mx-4"
                      :loading="vm.isSetting"
                      @click="vm.setSolanaAddress(address)"
                      >Done</v-btn
                    >
                  </div>
                </v-card>
              </div>
              <connect-metamask v-else class="mt-6" block :requiredChainId="vm.CHAIN_ID" />
            </div>
          </div>
        </div>
        <connect-metamask v-else class="mt-6" block :requiredChainId="vm.CHAIN_ID" />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Provide, Vue } from 'vue-property-decorator'
import { walletStore } from '@/stores/wallet-store'
import { SettingSolanaWalletViewModel } from '@/modules/ido/viewmodels/setting-solana-wallet-viewmodel'

@Observer
@Component({
  components: {}
})
export default class IdoPoolDetail extends Vue {
  @Provide() vm = new SettingSolanaWalletViewModel()
  walletStore = walletStore
  address = ''
}
</script>

<style scoped lang="scss">
.card {
  border-radius: 16px;
  max-width: 730px !important;
}
</style>
