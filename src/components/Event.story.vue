<template>
  <Story>
    <Variant title="Medal">
      <event
        :event="{ type: 'medal', contribution: 'edge_photographer', niveau: 2 }"
      />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
import Event from "./Event.vue";
</script>

<style scoped>

</style>
