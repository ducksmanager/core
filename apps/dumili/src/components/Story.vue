<template>
  <b>{{ story.storyversioncode }}</b
  >&nbsp;{{ storyDetails?.[story.storyversioncode]?.title }}
  <slot name="suffix" />
</template>
<script setup lang="ts">
import { stores as webStores } from "~web";
const { story } = defineProps<{
  story: {
    storyversioncode: string;
  };
}>();

useSlots();

const coaStore = webStores.coa();

const { storyDetails } = storeToRefs(coaStore);
</script>
