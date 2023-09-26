<template>
  <v-dialog v-model="vm.showBuyBoxDialog" max-width="468px" persistent>
    <v-card class="pa-6 buy-dialog">
      <div class="d-flex justify-space-between align-center">
        <div class="text-h6 font-weight-bold">Buy box</div>
        <v-btn icon :disabled="vm.buying" @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
      </div>
      <div class="inner-box1 mt-4">
        <div class="d-flex justify-space-between align-center">
          <div class="mr-8">Buy amount:</div>
          <!-- <v-text-field dense hide-details outlined rounded></v-text-field> -->
          <v-form ref="form">
            <v-text-field
              class="text-right"
              placeholder="0"
              :rules="[$rules.numberOnly, $rules.required]"
              @input="vm.changeInputNumber"
              outlined
              dense
              hide-details
              rounded
            >
            </v-text-field>
          </v-form>
        </div>
        <div class="d-flex justify-space-between align-center mt-2">
          <div>Unit price:</div>
          <div>{{ vm.itemUnitPrice | formatNumber(2) }} {{ vm.itemTradeSymbol }} per box</div>
        </div>
        <div v-if="vm.poolData.isShowProgress">
          <div class="d-flex justify-space-between align-center mt-2">
            <div>Box left:</div>
            <div>{{ vm.itemBoxLeft }} box(es)</div>
          </div>
          <div class="d-flex justify-space-between align-center mt-2">
            <div>Your allocation left:</div>
            <div>{{ vm.itemAllocationLeft | formatNumber(2) }} {{ vm.itemTradeSymbol }}</div>
          </div>
        </div>
      </div>
      <div class="my-6 d-flex justify-center">
        <v-icon color="success">mdi-arrow-down-thin</v-icon>
      </div>
      <div class="d-flex justify-end">
        <div class="mr-4">Your balance:</div>
        <div>{{ vm.userLPBalance | formatNumber(2) }} {{ vm.itemTradeSymbol }}</div>
      </div>
      <div class="inner-box2 mt-2">
        <div class="d-flex justify-space-between align-center">
          <div>Total buy</div>
          <div>{{ vm.inputNumber }} box(es)</div>
        </div>
        <div class="d-flex justify-space-between align-center mt-2">
          <div>Total pay</div>
          <div>{{ vm.itemTotalPay | formatNumber(2) }} {{ vm.itemTradeSymbol }}</div>
        </div>
      </div>
      <div class="mt-4" v-if="vm.itemConfigLoading">
        <v-btn color="primary" :loading="vm.itemConfigLoading" class="text-none full-width"></v-btn>
      </div>
      <div class="mt-4" v-else>
        <v-btn
          v-if="!vm.approved"
          @click="vm.approve()"
          :loading="vm.approving"
          class="text-none"
          color="primary"
          block
          outlined
          >Approve</v-btn
        >
        <v-btn v-else-if="vm.itemSoldOut" disabled color="grey" block>SOLD OUT</v-btn>
        <v-btn
          v-else
          color="primary"
          block
          class="text-none"
          :disabled="!vm.isValidNumberInput"
          :loading="vm.buying"
          @click="vm.buyBox()"
          >Buy</v-btn
        >
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Observer } from 'mobx-vue'
import { Component, Prop, Vue, Inject, Ref } from 'vue-property-decorator'
import { PoolDetailViewModel } from '../viewmodels/pool-detail-viewmodel'

@Observer
@Component({
  components: {}
})
export default class EndedCard extends Vue {
  @Inject() vm!: PoolDetailViewModel
  @Ref('form') form: any

  closeDialog() {
    this.form.reset()
    this.vm.closeBuyBoxDialog()
  }
}
</script>

<style scoped lang="scss">
.buy-dialog {
  background: #202020;
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.2);
  border-radius: 24px !important;
}

.inner-box1 {
  border: 1px solid #656565;
  border-radius: 24px !important;
  padding: 16px;
}

.inner-box2 {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), #121212;
  border: 1px solid #656565;
  box-shadow: 0px 11px 14px -5px rgba(0, 0, 0, 0.02);
  border-radius: 24px;
  padding: 16px;
}
</style>
