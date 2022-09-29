<template>
  <table v-if="username">
    <tr>
      <td>
        <a :href="r('/collection/show')"
        ><img id="logo" alt="logo" src="/images/logo_small.png"
        /></a>
      </td>
      <td>{{ $t("Collection DucksManager de") }} {{ username }}</td>
    </tr>
  </table>
</template>

<script setup lang="ts">

import { l10n } from "~/stores/l10n";
import { onMounted } from "vue";
import { collection } from "~/stores/collection";

const { r } = l10n();
let username = $ref(null)

onMounted(async () => {
  await collection().loadUser()
  username = collection().user?.username
})
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
