<template>
  <v-snackbar
    :value="controller.show"
    @input="controller.close()"
    :color="controller.config.color"
    :timeout="controller.config.timeout"
    bottom
    class="plugin__alert"
  >
    <v-icon class="mr-3">{{ controller.config.icon }}</v-icon>
    {{ controller.config.message }}
    <template v-slot:action="{ attrs }">
      <v-btn icon text v-bind="attrs" @click="controller.close()"><v-icon>close</v-icon></v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { snackController } from './snack-bar-controller'
@Component
export default class SnackBar extends Vue {
  controller = snackController
}
</script>

<style scoped></style>
