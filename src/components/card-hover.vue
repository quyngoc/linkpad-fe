<template>
  <v-hover v-slot="{ hover }">
    <v-sheet
      rounded="lg"
      :style="{
        border: hover ? `1px solid var(--v-primary-base)` : '1px solid transparent',
        backgroundColor: 'var(--v-dark2-base)',
        overflow: 'hidden'
      }"
      :v-bind="$attrs"
    >
      <slot />
    </v-sheet>
  </v-hover>
</template>

<script lang="ts">
export default {}
</script>

<style scoped lang="scss"></style>
