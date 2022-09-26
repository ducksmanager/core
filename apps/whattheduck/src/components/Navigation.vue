<template>
  <ion-segment :value="selected" @ionChange="selected = $event.detail.value">
    <ion-segment-button :key="key" v-for="{ key, text } in parts" :value="key">
      <ion-label>{{ text }}</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup>
import { IonSegment, IonSegmentButton, IonLabel } from "@ionic/vue";
import { onMounted, ref, computed } from "vue";
import { collection } from "@/stores/collection";
import { app } from "@/stores/app";

const collectionStore = collection();
const appStore = app();

const parts = computed(() => [
  {
    key: "allCountries",
    text: "All countries",
  },
  {
    key: appStore.currentCountry,
    text: appStore.currentCountry,
  },
  {
    key: appStore.currentPublication,
    text: appStore.currentPublication,
  },
]);

const selected = ref(
  appStore.currentPublication || appStore.currentCountry || "allCountries"
);

onMounted(async () => {
  await collectionStore.loadCollection();
});
</script>

<style lang="scss" scoped>
ion-segment-button {
  width: 33.333%;
  max-width: 33.333%;
  align-items: center;
  text-transform: none;

  ion-label {
    width: 100%;
  }

  &::part(native) {
    padding: 0;
  }
}
</style>
