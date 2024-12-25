<template>
  <template v-if="!data.length">
    <slot name="no-data" />
  </template>
  <table v-else>
    <thead>
      <th v-for="header in Object.keys(data[0])" :key="header" class="border">
        {{ header }}
      </th>
    </thead>
    <tbody>
      <tr v-for="(row, rowIdx) in data" :key="rowIdx">
        <td v-for="value in Object.values(row)" :key="value" class="border">
          {{ value }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="T extends object">
defineProps<{
  data: T[];
}>();

defineSlots<{
  "no-data"(): never;
}>();
</script>
