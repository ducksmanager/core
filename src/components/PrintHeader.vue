<template>
  <table v-if="username">
    <tr>
      <td>
        <router-link to="/collection/show"
          ><img id="logo" alt="logo" src="/images/logo_small.png"
        /></router-link>
      </td>
      <td>{{ $t("Collection DucksManager de") }} {{ username }}</td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { collection } from "~/stores/collection";

const username = $computed(() => collection().user?.username);
</script>

<style lang="scss" scoped>
#logo {
  height: 100px;
}

div table {
  width: 90%;
  font-size: 15px;
}

table tr td {
  &:nth-child(1) {
    text-align: left;
    width: 1%;
  }

  &:nth-child(2) {
    text-align: center;
  }
}
</style>
