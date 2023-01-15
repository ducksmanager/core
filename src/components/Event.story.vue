<template>
  <Story>
    <Variant title="Medal">
      <event :event="medalEvent" />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
import { MedalEvent } from "~types/events/MedalEvent";

import Event from "./Event.vue";
const medalEvent: MedalEvent = {
  type: "medal",
  contribution: "edge_photographer",
  level: 2,
  users: [null],
  timestamp: new Date().getTime(),
};
</script>

<style scoped>

</style>
