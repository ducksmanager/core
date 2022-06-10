<template>
  <span class="ago pl-2">{{ timeAgo }}</span>
</template>
<script setup>
import * as timeago from "timeago.js";

const { timestamp } = defineProps({
  timestamp: {
    type: Number,
    required: true,
  },
});
const timeAgo = $computed(() => timeago.format(timestamp * 1000));
</script>
<style scoped lang="scss">
.ago {
  float: right;
  color: grey;
  font-size: smaller;
}
</style>