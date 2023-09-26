<template>
  <v-avatar v-bind="$attrs" @click="$emit('click', $event)">
    <v-img :src="url"></v-img>
  </v-avatar>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator'
import { fileHelpers } from '@/helpers/file-helper'
import { apiService } from '@/services/api-service'
import { AppProvider } from '@/app-providers'
import { IReactionDisposer, reaction } from 'mobx'
import { Observer } from 'mobx-vue'

@Observer
@Component
export default class AppAvatar extends Vue {
  @Inject() providers!: AppProvider
  @Prop() avatar: any

  url: string | null = null
  _disposers: IReactionDisposer[] = []

  mounted() {
    this._disposers = [
      reaction(
        () => this.providers.themeType,
        () => this.updateImage()
      )
    ]
  }

  @Watch('avatar', { immediate: true }) async onAvatarChanged() {
    await this.updateImage()
  }

  async updateImage() {
    try {
      const val = this.avatar
      this.url = require(`../../assets/logo.${this.providers.themeType}.svg`)
      if (val instanceof File) {
        this.url = URL.createObjectURL(val)
      } else if (typeof val === 'string') {
        if (val) {
          const model = await apiService.getFile(val)
          this.url = fileHelpers.getApiFileUrl(model)
        }
      } else if (val) {
        this.url = fileHelpers.getApiFileUrl(val)
      }
    } catch (error) {
      console.error('onAvatarChanged', error)
    }
  }
}
</script>

<style scoped></style>
