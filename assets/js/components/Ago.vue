<template>
  <span class="ago">{{ timeAgo }}</span>
</template>
<script setup>
import * as timeago from "timeago.js";

const props = defineProps({
  timestamp: {
    type: Number,
    required: true,
  },
});

const timeAgo = () => timeago.format(props.timestamp * 1000);
</script>
<style scoped lang="scss">
.ago {
  float: right;
  color: grey;
  font-size: smaller;
}
</style>