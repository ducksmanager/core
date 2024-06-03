<template>
  <Story>
    <ColorfulRadioGroup
      v-model:id="currentItemId"
      :list="[
        { id: 1, name: 'item 1' },
        { id: 2, name: 'item 2' },
        { id: 3, name: 'item 3' },
      ]"
      :get-item-id="(item) => item.id"
      :get-checkbox-color="() => 'primary'"
  /></Story>
</template>
<script setup lang="ts">
const currentItemId = ref(1);
</script>
