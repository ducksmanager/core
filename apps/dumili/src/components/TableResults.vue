<template>
  <table>
    <thead v-if="data.length">
      <th
        v-for="header in Object.keys(data[0])"
        :key="header"
        style="border: 1px solid black"
      >
        {{ header }}
      </th>
    </thead>
    <tbody>
      <tr v-for="(row, rowIdx) in data" :key="rowIdx">
        <td
          v-for="value in Object.values(row)"
          :key="value"
          style="border: 1px solid black"
        >
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
</script>
