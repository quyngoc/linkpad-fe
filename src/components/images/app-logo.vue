<template>
  <v-img
    :src="url"
    :width="size"
    :max-height="size"
    :max-width="size"
    :height="size"
    @error="onLoadImgError"
    @click="$emit('click', $event)"
    contain
  ></v-img>
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
  @Prop({ default: 80, type: Number }) size!: number

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
      this.url = require(`../../assets/logo/momo-logo-2.png`)
      if (val instanceof File) {
        this.url = URL.createObjectURL(val)
      } else if (typeof val === 'string') {
        if (val && val.toLowerCase().startsWith('http')) {
          this.url = val
        } else if (val) {
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

  onLoadImgError() {
    this.url = require(`../../assets/logo/momo-logo-2.png`)
  }
}
</script>

<style scoped></style>
