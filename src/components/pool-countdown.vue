<template>
  <div>
    <div v-if="!!countDown" class="countDown" :style="countDownStyle">
      <span class="white--text">{{ label }} </span> {{ countDown }}
    </div>
  </div>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import moment from 'moment'

@Observer
@Component({})
export default class PoolCountdown extends Vue {
  //Prop time is unix (X) format
  @Prop({ default: '' }) text!: string
  @Prop({ default: '' }) countDownStyle: any
  @Prop() time!: number
  @Prop() type!: 'start' | 'end' | 'refund'
  @Prop() callback!: () => void
  countDown = ''
  @Watch('type', { immediate: true }) onTypeChange() {
    this.init()
  }
  init() {
    const x = setInterval(() => {
      const currentTime = Number(moment().format('x'))
      const distance = Number(moment(this.time, 'X').format('x')) - currentTime
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      this.countDown = `${days}d : ${hours}h : ${minutes}m : ${seconds}s`

      if (distance < 1) {
        clearInterval(x)
        this.callback()
        this.countDown = ''
      }
    }, 1000)
  }

  get label() {
    switch (this.type) {
      case 'end':
        return 'End in 🔥'
      case 'start':
        return 'Start in 🔥'
      case 'refund':
        return 'Refund timing end'
      default:
        return ''
    }
  }
}
</script>

<style scoped>
.countDown {
  border-radius: 24px;
  border: 1px solid #70feff;
  color: #70feff;
  width: fit-content;
  padding: 8px 16px 8px 16px;
}
</style>
