<template>
  <table v-if="username">
    <tbody>
      <tr>
        <td>
          <router-link to="/collection/show"
            ><img id="logo" alt="logo" :src="getImagePath('logo_small.png')"
          /></router-link>
        </td>
        <td>{{ $t("Collection de {username}", { username }) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
const { user } = storeToRefs(collection());

const username = $computed(() => user.value?.username);
const { getImagePath } = images();
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
