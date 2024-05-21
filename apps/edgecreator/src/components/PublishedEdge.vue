<template>
  <b-img
    :height="(naturalHeight * zoom) / 1.5"
    :src="getEdgeUrl()"
    @load="
      naturalHeight = $event.currentTarget.naturalHeight;
      $emit('load');
    "
    @error="$emit('error')"
  />
</template>

<script setup lang="ts">
import { main } from "~/stores/main";
import { ui } from "~/stores/ui";

const props = defineProps<{
  issuenumber: string;
}>();

defineEmits<(event: "load" | "error") => void>();

const naturalHeight = ref<number>(0);
const zoom = computed(() => ui().zoom);
const getEdgeUrl = () =>
  `${import.meta.env.VITE_EDGES_URL as string}/${main()
    .country!}/gen/${main().magazine!}.${props.issuenumber}.png`;
</script>
