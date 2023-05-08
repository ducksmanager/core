<template>
  <ion-item button>
    <ion-label>
      <slot name="label" />
    </ion-label>
    <ion-label slot="end">
      <slot name="stats" />
    </ion-label>
  </ion-item>
</template>

<script setup lang="ts">
import { IonLabel, IonItem } from '@ionic/vue';
</script>
