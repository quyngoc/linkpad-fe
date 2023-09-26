<template>
  <v-dialog rounded="0" v-model="dialog" scrollable max-width="420" @keydown.esc="cancel">
    <v-card>
      <div class="pa-6">
        <div class="d-flex justify-space-between align-center ">
          <div class="text-h5 font-weight-bold">Settings</div>
          <v-btn icon @click="cancel" small>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <v-divider />
      <vue-scroll>
        <div class="pa-6">
          <div class="text-h6 font-weight-bold">Transaction Settings</div>
          <div class="d-flex align-center my-2">
            <span class="font-weight-medium mr-2">Slippage tolerance</span>
            <v-btn icon x-small color="grey"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
          </div>
          <div class="d-flex align-center">
            <v-chip-group active-class="primary black--text">
              <v-chip :key="0.1">0.1%</v-chip>
              <v-chip :key="0.5">0.5%</v-chip>
              <v-chip :key="1">1%</v-chip>
            </v-chip-group>
            <v-text-field hide-details outlined rounded dense>
              <div slot="append-outer" class="pt-1">
                %
              </div>
            </v-text-field>
          </div>
          <div class="d-flex align-center my-2">
            <span class="font-weight-medium mr-2">Transaction deadline</span>
            <v-btn icon x-small color="grey"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
          </div>
          <div class="d-flex align-center">
            <v-text-field hide-details outlined rounded dense style="max-width: 100px" :value="20" />
            <span class="ml-3">minutes</span>
          </div>
          <div class="text-h6 font-weight-bold mt-6">Interface Settings</div>
          <div class="d-flex align-center justify-space-between  my-2">
            <div class="d-flex">
              <span class="font-weight-medium mr-2">Slippage tolerance</span>
              <v-btn icon x-small color="grey"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
            </div>
            <v-switch hide-details class="ma-0 mb-1" />
          </div>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex">
              <span class="font-weight-medium mr-2">Disable Multihops</span>
              <v-btn icon x-small color="grey"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
            </div>
            <v-switch hide-details class="ma-0 mb-1" />
          </div>
        </div>
      </vue-scroll>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      list: ['ETH', 'BNB', 'BUSD', 'LP3', 'WBNB'],
      resolve: null
    }
  },
  methods: {
    open() {
      this.dialog = true
      return new Promise(r => (this.resolve = r))
    },
    select(item) {
      this.dialog = false
      this.resolve(item)
    },
    cancel() {
      this.dialog = false
      this.resolve(null)
    }
  }
}
</script>

<style scoped></style>
