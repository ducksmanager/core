<template>
  <div v-if="l10n">
    <table>
      <tr>
        <td>
          <a href="/collection/show"><img
            id="logo"
            alt="logo"
            :src="`${imagePath}/logo_small.png`"
          ></a>
        </td>
        <td>{{ l10n.COLLECTION_DE }} {{ username }}</td>
      </tr>
    </table>
    <Collectable v-if="currentType === 'collectable'" />
    <Classic v-else-if="currentType === 'classic'" />
  </div>
</template>

<script>
import Collectable from "../layouts/print/Collectable";
import Classic from "../layouts/print/Classic";
import l10nMixin from "../mixins/l10nMixin";
import userMixin from "../mixins/userMixin";

export default {
  name: "Print",
  components: {
    Collectable,
    Classic
  },
  mixins: [l10nMixin, userMixin],
  props: {
    currentType: {type: String, required: true}
  },
  computed: {
    imagePath: () => window.imagePath
  }
}
</script>

<style lang="scss">
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