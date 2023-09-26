<template>
  <v-container class="px-6 py-10">
    <v-row>
      <v-col cols="12" sm="6" class="d-flex flex-column">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require(`../assets/logo-with-name.${providers.themeType}.svg`)"
          transition="scale-transition"
          width="180"
        />
        <span class="caption">
          Next-generation DEFI platform with an Ecosystem launcher
        </span>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        class="d-flex align-center"
        :class="{
          'justify-end': $vuetify.breakpoint.smAndUp,
          'justify-start': $vuetify.breakpoint.xs
        }"
      >
        <a href="https://medium.com/@bsclaunchofficial">
          <v-icon>
            fab fa-medium-m
          </v-icon>
        </a>
        <a href="https://t.me/Bsclaunchchannel" class="ml-8">
          <v-icon>
            fab fa-telegram-plane
          </v-icon>
        </a>
        <a href="https://t.me/Bsclaunchgroup" class="ml-8">
          <v-icon>
            fab fa-telegram
          </v-icon>
        </a>
        <a href="https://twitter.com/BSClaunchorg" class="ml-8">
          <v-icon>
            fab fa-twitter
          </v-icon>
        </a>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Vue, Inject } from 'vue-property-decorator'
import { AppProvider } from '@/app-providers'

@Observer
@Component
export default class Footer extends Vue {
  @Inject() providers!: AppProvider
}
</script>

<style></style>
