<template>
  <div
    class="fill-height"
    :class="{
      'root-dark': $vuetify.theme.dark,
      'root-light': !$vuetify.theme.dark
    }"
  >
    <div class="intro-background">
      <div class="wave-left d-none d-sm-flex"></div>
      <div class="wave-right d-none d-sm-flex"></div>
      <v-container
        class="d-flex flex-column px-6"
        :class="{
          'align-center sologan-desktop': $vuetify.breakpoint.smAndUp,
          'py-8 sologan-mobile': $vuetify.breakpoint.xs
        }"
      >
        <div
          :class="{
            'text-h2 text-center font-weight-black': $vuetify.breakpoint.smAndUp && vm.ido,
            'text-h4 text-center font-weight-black': $vuetify.breakpoint.smAndUp && !vm.ido,
            'text-h5 font-weight-bold': $vuetify.breakpoint.xs
          }"
        >
          <span
            :class="{
              'primary--text': true,
              'text-h2 font-weight-black': $vuetify.breakpoint.smAndUp,
              'text-h5 font-weight-bold': $vuetify.breakpoint.xs
            }"
            >Linkpad<br
          /></span>
          <div class="my-4 font-weight-medium">
            B-NFT represents an NFT marketplace for high-quality projects to offer potential NFTs to end-users at a
            reasonable price
          </div>
        </div>
      </v-container>
    </div>
    <div class="primary lighten-1">
      <v-container>
        <div v-if="!!vm.featurePools.length">
          <div class="d-flex flex-column align-center mt-6">
            <div class="text-h5 font-weight-bold" :class="{ 'text-h6': $vuetify.breakpoint.smAndDown }">
              FEATURE POOLS
            </div>
            <div class="title-underline"></div>
          </div>
          <div v-for="pool in vm.featurePools" :key="pool.id" class="mt-6 nft-card-box">
            <v-row>
              <v-col md="4" sm="12">
                <div class="full-height d-flex align-center">
                  <v-img
                    :src="require(`@/assets/nfts/${pool.id}/${pool.coverUrl}`)"
                    contain
                    max-height="240"
                    style="border-radius: 16px"
                  ></v-img>
                </div>
              </v-col>
              <v-col md="8" sm="12">
                <div class="d-flex align-center flex-wrap">
                  <div class="d-flex align-center">
                    <div><v-img width="32" :src="require(`@/assets/nfts/${pool.id}/${pool.nftIcon}`)"></v-img></div>
                    <div class="text-h4 font-weight-bold mx-5" :class="{ 'text-h6': $vuetify.breakpoint.smAndDown }">
                      {{ pool.name }}
                    </div>
                  </div>
                  <div class="text-h4 font-weight-bold ml-4" :class="{ 'text-h6': $vuetify.breakpoint.smAndDown }">
                    {{ pool.symbol }}
                  </div>
                </div>
                <div class="nft-descriptions mt-4">
                  <i>
                    {{ pool.description }}
                  </i>
                </div>
                <div v-if="!isUpCommingPool(pool)" :style="{ 'max-width': $vuetify.breakpoint.mdAndUp ? '50%' : '' }">
                  <div v-if="pool.isShowProgress">
                    <div class="d-flex justify-space-between mt-4">
                      <div class="text-caption">{{ ((pool.totalBoughtNft * 100) / +pool.saleAmount) | round(0) }}%</div>
                      <div class="text-caption progress-text">{{ pool.totalBoughtNft }} / {{ pool.saleAmount }}</div>
                    </div>
                    <div class="mt-1">
                      <v-progress-linear
                        height="12"
                        :value="(pool.totalBoughtNft * 100) / +pool.saleAmount"
                        rounded
                      ></v-progress-linear>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-space-between align-center mt-4">
                  <v-row>
                    <v-col md="6" sm="12" class="d-flex align-center">
                      <router-link :to="`/b-nft/${pool.key}`">
                        <v-btn color="primary" dense class="text-none mr-6" v-if="isUpCommingPool(pool)"
                          >Read more</v-btn
                        >
                        <v-btn color="primary" dense class="text-none mr-6" v-else>Join Pool</v-btn>
                      </router-link>
                      <a v-if="pool.mediumLink" target="_blank" :href="pool.mediumLink">
                        <v-img
                          max-height="28px"
                          max-width="28px"
                          :src="require('@/assets/medium.svg')"
                          class="mr-2"
                        ></v-img>
                      </a>
                      <a v-if="pool.twitterLink" target="_blank" :href="pool.twitterLink">
                        <v-img
                          max-height="28px"
                          max-width="28px"
                          :src="require('@/assets/twitter.svg')"
                          class="mr-2"
                        ></v-img>
                      </a>
                      <a v-if="pool.telegramLink" target="_blank" :href="pool.telegramLink">
                        <v-img
                          max-height="28px"
                          max-width="28px"
                          :src="require('@/assets/telegram.svg')"
                          class="mr-2"
                        ></v-img>
                      </a>
                      <a v-if="pool.website" target="_blank" :href="pool.website">
                        <v-img max-height="28px" max-width="28px" :src="require('@/assets/web.svg')"></v-img>
                      </a>
                    </v-col>
                    <v-col md="6" sm="12">
                      <PoolCountDown
                        :text="isUpCommingPool(pool) ? 'Open in:' : 'Close in:'"
                        :time="isUpCommingPool(pool) ? pool.startDate : pool.endDate"
                        :type="isUpCommingPool(pool) ? 'open' : 'close'"
                        :callback="reloadComponent"
                      ></PoolCountDown>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </div>
          <v-divider class="my-8"></v-divider>
        </div>

        <div v-if="!!vm.upcomingPools.length">
          <div class="d-flex flex-column align-center">
            <div class="text-h5 font-weight-bold" :class="{ 'text-h6': $vuetify.breakpoint.smAndDown }">
              UPCOMING POOLS
            </div>
            <div class="title-underline"></div>
          </div>
          <div class="mt-6">
            <v-row>
              <v-col md="4" sm="12" v-for="pool in vm.upcomingPools" :key="pool.id">
                <UpCommingCard :data="pool"></UpCommingCard>
              </v-col>
            </v-row>
          </div>
          <v-divider class="my-8"></v-divider>
        </div>

        <div v-if="!!vm.endedPools.length">
          <div class="d-flex flex-column align-center">
            <div class="text-h5 font-weight-bold" :class="{ 'text-h6': $vuetify.breakpoint.smAndDown }">
              SALE ENDED
            </div>
            <div class="title-underline"></div>
          </div>
          <div class="mt-6 mb-8">
            <v-row>
              <v-col md="4" sm="12" v-for="pool in vm.endedPools" :key="pool.id">
                <router-link :to="`/b-nft/${pool.key}`">
                  <EndedCard :data="pool"></EndedCard>
                </router-link>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-container>
    </div>
    <!-- <company-footer /> -->
  </div>
</template>

<script>
import { Observer } from 'mobx-vue'
import { Component, Vue, Provide } from 'vue-property-decorator'
import { PoolViewModel } from '../viewmodels/pool-viewmodel'
import moment from 'moment'
import UpCommingCard from '../components/up-comming-card.vue'
import EndedCard from '../components/ended-card.vue'
import PoolCountDown from '@/components/pool-countdown.vue'

@Observer
@Component({
  components: {
    UpCommingCard,
    EndedCard,
    PoolCountDown
  }
})
export default class Pools extends Vue {
  @Provide() vm = new PoolViewModel()

  reloadComponent() {
    this.$forceUpdate()
    this.vm.loadPools()
  }

  isUpCommingPool(pool) {
    return !!moment(pool.startDate, 'X').isAfter(moment())
  }

  isOnSalePool(pool) {
    return !!(moment(pool.startDate, 'X').isAfter(moment()) && moment(pool.endDate, 'X').isAfter(moment()))
  }

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
.intro-background {
  position: relative;
  overflow: hidden;
}
.wave-left {
  position: absolute;
  background: url('../../../assets/images/wave-background.dark.svg');
  left: -200px;
  bottom: -150px;
  width: 725px;
  height: 750px;
  overflow: hidden;
}
.wave-right {
  position: absolute;
  background: url('../../../assets/images/wave-background.dark.svg');
  top: -100px;
  right: -175px;
  width: 725px;
  height: 750px;
  overflow: hidden;
  transform: rotate(180deg);
}
.root-light {
  .wave-left {
    background: url('../../../assets/images/wave-background.light.svg');
  }
  .wave-right {
    background: url('../../../assets/images/wave-background.light.svg');
  }
}
.sologan-desktop {
  padding: 120px 0;
}

.banner {
  background: url('../../../assets/images/nft-banner.png');
  height: 474px;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: bottom;
}

.title-underline {
  width: 111.89px;
  height: 6.41px;
  background: #4dee5d;
  border: 0.5px solid #ffffff;
  border-radius: 4px;
}

.nft-card-box {
  background: linear-gradient(86.56deg, #202020 30.46%, rgba(32, 32, 32, 0) 99.51%);
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));
  border-radius: 16px;
  padding: 32px;
}
</style>
