<template>
  <span class="ago pl-2">{{ timeAgo }}</span>
</template>
<script setup lang="ts">
import { format as timeAgoFormat } from "timeago.js";

const props = defineProps<{
    timestamp: number;
  }>(),
  timeAgo = $computed(() => timeAgoFormat(props.timestamp * 1000));
</script>
<style scoped lang="scss">
.ago {
  float: right;
  color: grey;
  font-size: smaller;
}
</style>
