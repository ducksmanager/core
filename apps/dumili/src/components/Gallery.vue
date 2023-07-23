<template>
  <b-container
    fluid
    class="d-flex flex-column align-items-center justify-content-center flex-grow-1"
  >
    <b-row v-if="images" align-h="center">
      <b-col
        class="col position-relative d-flex justify-content-center align-items-center p-3 pb-5"
        :class="{ selectable, selected: selectedUrl === url }"
        v-for="{ url, text } of images"
        :key="url"
        cols="12"
        md="4"
        @click="selectedUrl = url"
      >
        <b-img :src="url" fluid thumbnail />
        <div class="position-absolute bottom-0 text-center">
          <slot v-if="$slots" :issuecode="text" />
          <template v-else>{{ text || "Titre inconnu" }}</template>
        </div>
      </b-col>
    </b-row>
    <b-container v-else>Loading...</b-container>
  </b-container>
</template>
<script lang="ts" setup>
defineProps<{
  images: { url: string; text: string }[];
  selectable?: boolean;
}>();

defineSlots<{
  default(props: { issuecode: string }): any;
}>();

const emit = defineEmits<{
  (e: "selected", url: string): void;
}>();

const selectedUrl = ref<string | undefined>(undefined);

watch(
  () => selectedUrl.value,
  (url) => {
    if (url) {
      emit("selected", url);
    }
  }
);
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
