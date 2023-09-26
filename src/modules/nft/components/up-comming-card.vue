<template>
  <router-link :to="`/b-nft/${data.key}`">
    <div class="upcomming-card">
      <div style="position: relative">
        <div>
          <v-img :src="require(`@/assets/nfts/${data.id}/${data.coverUrl}`)" style="border-radius: 16px"></v-img>
        </div>
        <v-img
          :src="require(`@/assets/nfts/${data.id}/${data.nftIcon}`)"
          max-width="80px"
          max-height="80px"
          style="position: absolute; bottom: -20px"
        ></v-img>
      </div>
      <div class="mt-8 text-h6 font-weight-bold">
        {{ data.name }}
      </div>
      <v-divider class="my-5"></v-divider>
      <div class="d-flex justify-space-between align-center mt-2">
        <div>Total raise:</div>
        <div>${{ data.totalRaise }}</div>
      </div>
      <div class="d-flex justify-space-between align-center mt-2">
        <div>Sale amount:</div>
        <div>{{ data.saleAmount }} NFTs</div>
      </div>
      <div class="d-flex justify-space-between align-center mt-2">
        <div>Social:</div>
        <div class="d-flex align-center">
          <a v-if="data.mediumLink" target="_blank" :href="data.mediumLink">
            <v-img max-height="28px" max-width="28px" :src="require('@/assets/medium.svg')" class="mr-2"></v-img>
          </a>
          <a v-if="data.twitterLink" target="_blank" :href="data.twitterLink">
            <v-img max-height="28px" max-width="28px" :src="require('@/assets/twitter.svg')" class="mr-2"></v-img>
          </a>
          <a v-if="data.telegramLink" target="_blank" :href="data.telegramLink">
            <v-img max-height="28px" max-width="28px" :src="require('@/assets/telegram.svg')" class="mr-2"></v-img>
          </a>
          <a v-if="data.website" target="_blank" :href="data.website">
            <v-img max-height="28px" max-width="28px" :src="require('@/assets/web.svg')"></v-img>
          </a>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
import { Observer } from 'mobx-vue'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Observer
@Component({
  components: {}
})
export default class UpCommingCard extends Vue {
  @Prop() data
  slugify(text) {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  }
}
</script>

<style scoped lang="scss">
.upcomming-card {
  background: linear-gradient(86.56deg, #202020 30.46%, rgba(32, 32, 32, 0) 99.51%);
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));
  border-radius: 16px;
  padding: 28px;
}
</style>
