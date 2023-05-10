<template>
  <ion-page>
    <ion-item
      ><ion-label>Condition</ion-label>

      <ion-radio-group value="custom-checked">
        <ion-radio class="dm-condition-background missing" value="missing" aria-label="Missing issue"></ion-radio>
        <ion-radio class="dm-condition-background unknown" value="unknown" aria-label="Unknown condition"></ion-radio>
        <ion-radio class="dm-condition-background bad" value="bad" aria-label="Bad condition"></ion-radio>
        <ion-radio
          class="dm-condition-background notsogood"
          value="notsogood"
          aria-label="Not-so-good condition"
        ></ion-radio>
        <ion-radio
          class="dm-condition-background good"
          value="good"
          aria-label="Good condition"
        ></ion-radio> </ion-radio-group
    ></ion-item>
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonLabel, IonRadioGroup, IonRadio, IonItem } from '@ionic/vue';
</script>

<style scoped lang="scss">
ion-radio::part(container) {
  width: 30px;
  height: 30px;

  border-radius: 16px;
  border: 2px solid #ddd;
}

ion-radio {
  &::part(mark) {
    width: 100%;
    height: 100%;
  }
}
</style>
