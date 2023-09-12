<template>
  <b-tooltip :target="target">
    <table>
      <thead>
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
    </table></b-tooltip
  >
</template>

<script setup lang="ts" generic="T extends object">
defineProps<{
  target: string;
  data: T[];
}>();
</script>
