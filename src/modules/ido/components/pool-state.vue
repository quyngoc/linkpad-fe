<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <div :class="`d-flex py-1 px-2 rounded-pill align-center ${backgroundClass}`" v-bind="attrs" v-on="on">
          <div :class="`rounded-circle ${circleClass}`" style="width: 12px; height: 12px"></div>
          <span :class="`ml-2 text-caption font-weight-medium ${textClass} text-no-wrap`">{{ text }}</span>
        </div>
      </template>
      <span>{{ time }}</span>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { PoolState, formatDuration } from '../business/swap-contract.business'
import moment from 'moment'
@Observer
@Component({ components: {} })
export default class FeaturedPoolItem extends Vue {
  @Prop() state?: PoolState

  text = ''
  time = ''
  warn = false

  @Watch('state', { immediate: true }) onStateChanged(state: PoolState) {
    if (!state) return
    const { ended, started, filled, startDuration, endDuration, startDate, endDate, isTBAStartDate } = state
    if (ended) {
      this.text = filled ? 'Filled' : 'Closed'
      this.warn = !filled
      this.time = filled
        ? `Published at ${moment(endDate).format('DD/MM/YYYY HH:mm:ss')}`
        : `Ended at ${moment(endDate).format('DD/MM/YYYY HH:mm:ss')}`
      // this.warn = !filled
    } else if (started) {
      this.text = filled ? 'Filled' : `Open`
      this.time = `End at ${moment(endDate).format('DD/MM/YYYY HH:mm:ss')}`
    } else {
      if (isTBAStartDate) {
        this.text = 'TBA'
        this.time = 'TBA'
      } else {
        this.text = `in ${formatDuration(startDuration)}`
        this.time = `Start at ${moment(startDate).format('DD/MM/YYYY HH:mm:ss')}`
      }
    }
  }

  get backgroundClass() {
    return this.warn ? 'error-background' : 'success-background'
  }
  get circleClass() {
    return this.warn ? 'red' : 'green'
  }
  get textClass() {
    return this.warn ? 'red--text' : 'green--text'
  }
}
</script>

<style lang="scss">
.error-background {
  background-color: rgba(255, 92, 89, 0.2);
}
.success-background {
  background-color: rgba(89, 255, 190, 0.2);
}
</style>
