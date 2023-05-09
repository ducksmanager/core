<template>
  <ion-item button>
    <ion-progress-bar v-if="stat !== undefined" :value="fillPercentage"></ion-progress-bar>
    <ion-label>
      <slot name="label" />
    </ion-label>
    <ion-label slot="end" v-if="stat"> {{ stat.numerator }} / {{ stat.denominator }} </ion-label>
  </ion-item>
</template>

<script setup lang="ts">
import { IonLabel, IonItem, IonProgressBar } from '@ionic/vue';
import { computed } from 'vue';
const props = defineProps<{
  stat?: {
    numerator: number;
    denominator: number;
  };
}>();

const fillPercentage = computed(() =>
  props.stat ? Math.max(0.1 / 100, props.stat.numerator / (props.stat.denominator || 1)) : undefined
);
</script>

<style lang="scss">
ion-label {
  z-index: 1;
}
ion-progress-bar {
  position: absolute;
  height: 100%;
  &::part(track) {
    background-color: transparent;
    opacity: 0.2;
  }
  &::part(progress) {
    height: 100%;
  }
}
</style>
