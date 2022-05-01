<template>
  <span class="ago pl-2">{{ timeAgo }}</span>
</template>
<script setup>
import * as timeago from "timeago.js";
import { computed } from "vue";

const props = defineProps({
    timestamp: {
      type: Number,
      required: true,
    },
  }),
  timeAgo = computed(() => timeago.format(props.timestamp * 1000));
</script>
<style scoped lang="scss">
.ago {
  float: right;
  color: grey;
  font-size: smaller;
}
</style>