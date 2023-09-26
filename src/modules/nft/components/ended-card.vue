<template>
  <div class="ended-card">
    <v-row class="align-center">
      <v-col md="6" sm="12">
        <div>
          <v-img
            max-height="100"
            :src="require(`@/assets/nfts/${data.id}/${data.coverUrl}`)"
            style="border-radius: 16px"
            contain
          ></v-img>
        </div>
      </v-col>
      <v-col md="6" sm="12">
        <div>{{ data.name }}</div>
        <v-divider class="my-3"></v-divider>
        <div class="d-flex justify-space-between align-center">
          <div class="text-h6 font-weight-bold">{{ data.totalRaise }}</div>
        </div>
        <div>{{ data.saleAmount }} NFTs</div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { Observer } from 'mobx-vue'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Observer
@Component({
  components: {}
})
export default class EndedCard extends Vue {
  @Prop() data
}
</script>

<style scoped lang="scss">
.ended-card {
  background: linear-gradient(86.56deg, #202020 30.46%, rgba(32, 32, 32, 0) 99.51%);
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));
  border-radius: 16px;
  padding: 20px;
}
</style>
