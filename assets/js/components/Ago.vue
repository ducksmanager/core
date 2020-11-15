<template>
  <span class="ago">{{ timeAgo }}</span>
</template>
<script>
import * as timeago from "timeago.js";

export default {
  name: 'Ago',
  props: {
    timestamp: {
      type: Number,
      required: true
    }
  },

  computed: {
    timeAgo() {
      return timeago.format(this.timestamp * 1000)
    }
  }
}
</script>
<style scoped lang="scss">
  .ago {
    float: right;
    color: grey;
    font-size: smaller;
  }
</style>