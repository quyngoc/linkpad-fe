<template>
  <v-dialog :value="dialog" max-width="456">
    <v-card color="dark2" rounded="lg" class="pa-6">
      <div class="d-flex flex-column gap-7">
        <div class="d-flex align-center justify-space-between">
          <div class="text-head4">Refund All</div>
          <v-btn depressed color="transparent" fab max-height="16" max-width="16" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div style="font-size: 14px;">
          Are you sure you want to refund all? By refunding amount, no tokens will be stocked.
        </div>
        <div class="font-weight-bold" v-if="!allowRefundUsd">
          This is actions to register Refund USD. We will airdop to all users after the refund timing is ended.
        </div>

        <div
          style="border-radius: 10px;border: 1px solid var(--g1, #0146FF);"
          class="pa-5 d-flex justify-space-between"
        >
          <div class="light2--text" style="font-size: 14px;">
            Total refund available
          </div>

          <div class="text-body-bold">{{ val | round(5) }} {{ tokenName }}</div>
        </div>

        <v-btn depressed rounded block color="gradient-btn" @click="confirm">
          Confirm
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { promiseHelper } from '@/helpers/promise-helper'
import { Observer } from 'mobx-vue'
import { Component, Vue } from 'vue-property-decorator'

@Observer
@Component
export default class extends Vue {
  dialog = false
  resolve: any
  val = 0
  tokenName = ''
  allowRefundUsd = false

  async open(allowRefundUsd: boolean, val: number, tokenName: string) {
    this.allowRefundUsd = allowRefundUsd
    this.val = val
    this.tokenName = tokenName
    this.dialog = true
    await promiseHelper.delay(100)
    return new Promise(r => (this.resolve = r))
  }

  async confirm() {
    this.resolve(true)
    await promiseHelper.delay(100)
    this.dialog = false
  }

  async close() {
    this.resolve(false)
    await promiseHelper.delay(100)
    this.dialog = false
  }
}
</script>

<style scoped></style>
