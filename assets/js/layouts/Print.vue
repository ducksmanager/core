<template>
  <div v-if="l10nRoutes">
    <table>
      <tr>
        <td>
          <a :href="$r('/collection/show')"><img
            id="logo"
            alt="logo"
            :src="`${imagePath}/logo_small.png`"
          ></a>
        </td>
        <td>{{ $t('Collection DucksManager de') }} {{ username }}</td>
      </tr>
    </table>
    <Collectable v-if="currentType === 'collectable'" />
    <Classic v-else-if="currentType === 'classic'" />
  </div>
</template>

<script setup>
import Collectable from "../layouts/print/Collectable";
import Classic from "../layouts/print/Classic";
import {l10n} from "../stores/l10n";
import {user} from "../composables/global";

defineProps({
  currentType: {type: String, required: true}
})

const {l10nRoutes, $r: r} = l10n()
const {username} = user()
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
