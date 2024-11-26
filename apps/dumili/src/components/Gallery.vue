<template>
  <b-container
    fluid
    class="d-flex flex-column align-items-center justify-content-center flex-grow-1 overflow-y-auto"
  >
    <b-row
      v-if="images"
      ref="imagesRef"
      align-h="center"
      class="overflow-y-auto"
    >
      <b-col
        v-for="{ url, id } of images"
        :key="id"
        class="position-relative d-flex justify-content-center align-items-center p-3 pb-5 border"
        :class="{ selectable, selected: selectedId === id }"
        cols="12"
        md="4"
        @click="selectedId = id"
      >
        <b-img v-if="url" :src="url" fluid thumbnail />
        <div class="position-absolute bottom-0 text-center">
          {{ id }}
        </div>
      </b-col>
    </b-row>
    <b-container v-else>{{ $t("Chargement...") }}</b-container>
  </b-container>
</template>
<script lang="ts" setup>
import {
  moveArrayElement,
  useSortable,
} from "@vueuse/integrations/useSortable";

import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const { images } = defineProps<{
  images: { url: string | null; id: number }[];
  selectable?: boolean;
}>();

defineSlots<{
  default(props: { issuecode: string }): never;
}>();

const emit = defineEmits<{
  (e: "selected", id: number): void;
}>();

const { t: $t } = useI18n();

const imagesRef = ref<HTMLElement | null>(null);
useSortable(imagesRef, images, {
  multiDrag: true,
  selectedClass: "selected",
  fallbackTolerance: 3,
  animation: 150,

  onUpdate: async (e) => {
    moveArrayElement(images, e.oldIndex, e.newIndex, e);
    nextTick(() => {
      indexationSocket.value?.services.updatePageUrls(images);
    });
  },
});

const selectedId = ref<number | undefined>(undefined);

watch(selectedId, (id) => {
  if (id) {
    emit("selected", id);
  }
});
</script>
<style scoped lang="scss">
.col {
  flex-grow: 1;
  pointer-events: none;
  &.selectable {
    cursor: pointer;
    pointer-events: all;

    &.selected {
      border: 2px solid #0d6efd;
      border-radius: 0.25rem;
    }
  }
}
</style>
