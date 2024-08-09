<template>
  <Story>
    <Variant title="Medal">
      <event :event="medalEvent" />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
import type { MedalEvent } from "~dm-types/events/MedalEvent";

const medalEvent: MedalEvent = {
  type: "medal",
  contribution: "edge_photographer",
  level: 2,
  users: [null],
  timestamp: new Date().getTime(),
};
</script>
