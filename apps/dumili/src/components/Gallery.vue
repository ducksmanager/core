<template>
  <b-container
    fluid
    class="d-flex flex-column align-items-center justify-content-center flex-grow-1 overflow-y-auto"
  >
    <b-row v-if="images" align-h="center" class="overflow-y-auto">
      <b-col
        v-for="{ url, text } of images"
        :key="url"
        class="position-relative d-flex justify-content-center align-items-center p-3 pb-5 border"
        :class="{ selectable, selected: selectedUrl === url }"
        cols="12"
        md="4"
        @click="selectedUrl = url"
      >
        <b-img :src="url" fluid thumbnail />
        <div class="position-absolute bottom-0 text-center">
          <slot v-if="$slots['default']" :issuecode="text" />
          <template v-else>{{ text || "Titre inconnu" }}</template>
        </div>
      </b-col>
    </b-row>
    <b-container v-else>{{ $t("Loading...") }}</b-container>
  </b-container>
</template>
<script lang="ts" setup>
defineProps<{
  images: { url: string; text: string }[];
  selectable?: boolean;
}>();

defineSlots<{
  default(props: { issuecode: string }): never;
}>();

const emit = defineEmits<{
  (e: "selected", url: string): void;
}>();

const { t: $t } = useI18n();

const selectedUrl = ref<string | undefined>(undefined);

watch(selectedUrl, (url) => {
  if (url) {
    emit("selected", url);
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
