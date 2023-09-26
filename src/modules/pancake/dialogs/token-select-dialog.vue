<template>
  <v-dialog v-model="dialog" scrollable max-width="420" @keydown.esc="cancel">
    <v-card>
      <div class="pa-6 ">
        <div class="d-flex justify-space-between align-center ">
          <div class="text-h5 font-weight-bold">Select a token</div>
          <v-btn icon @click="cancel" small>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-text-field hide-details outlined rounded dense class="mt-6" placeholder="Search name or past address" />
      </div>
      <v-divider />
      <vue-scroll>
        <v-list flat>
          <v-list-item v-for="(item, i) in list" :key="i" @click="select(item)" class="px-6">
            <v-list-item-icon class="mr-4">
              <app-avatar size="28" />
            </v-list-item-icon>
            <v-list-item-content>
              {{ item }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
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

<style scoped lang="scss"></style>
