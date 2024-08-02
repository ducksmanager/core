<template>
  <b-img
    :height="(naturalHeight * zoom) / 1.5"
    :src="getEdgeUrl(issuecode, 'png', true)"
    @load="
      naturalHeight = $event.currentTarget.naturalHeight;
      $emit('load');
    "
    @error="$emit('error')"
  />
</template>

<script setup lang="ts">
import { ui } from "~/stores/ui";

defineProps<{
  issuecode: string;
}>();

defineEmits<(event: "load" | "error") => void>();

const naturalHeight = ref(0);
const { zoom } = storeToRefs(ui());

const { getEdgeUrl } = useSvgUtils();
</script>
