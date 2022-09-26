<template>
  <ion-segment
    :value="appStore.currentNavigationItem"
    @ionChange="appStore.currentNavigationItem = $event.detail.value || null"
  >
    <ion-segment-button :key="key" v-for="{ key, text } in parts" :value="key">
      <ion-label>{{ text }}</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup>
import { IonSegment, IonSegmentButton, IonLabel } from "@ionic/vue";
import { onMounted, computed } from "vue";
import { collection } from "@/stores/collection";
import { app } from "@/stores/app";

const collectionStore = collection();
const appStore = app();

const parts = computed(() => {
  const parts = [
    {
      key: null,
      text: "All countries",
    },
  ];
  if (appStore.currentNavigationItem) {
    const publicationParts = appStore.currentNavigationItem.split("/");
    parts.push({
      key: publicationParts[0],
      text: publicationParts[0],
    });
    if (publicationParts.length === 2) {
      parts.push({
        key: appStore.currentNavigationItem,
        text: appStore.currentNavigationItem,
      });
    }
  }
  return parts;
});

onMounted(async () => {
  await collectionStore.loadCollection();
});
</script>

<style lang="scss" scoped>
ion-segment {
  justify-content: start;
}

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
