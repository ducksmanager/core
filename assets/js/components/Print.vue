<template>
  <div v-if="l10n">
    <table>
      <tr>
        <td>
          <a href="/?action=gerer"><img alt="logo" id="logo" :src="`${imagePath}/logo_small.png`" /></a></td>
        <td>{{ l10n.COLLECTION_DE }} {{ username }}</td>
      </tr>
    </table>
    <Collectable v-if="type === 'collectable'"/>
    <Classic v-else-if="type === 'classic'"/>
  </div>
</template>

<script>
import Collectable from "./Collectable";
import Classic from "./Classic";
import l10nMixin from "../mixins/l10nMixin";
import userMixin from "../mixins/userMixin";

export default {
  name: "Print",
  props: {
    type: String
  },
  computed: {
    imagePath: () => window.imagePath
  },
  mixins: [l10nMixin, userMixin],
  components: {
    Collectable,
    Classic
  }
}
</script>

<style scoped>
  #logo {
    height: 100px;
  }
  div table {
    width: 90%;
    font-size: 15px
  }
  table tr td:nth-child(1) {
    text-align: left;
    width:1%;
  }
  table tr td:nth-child(2) {
    text-align: center;
  }
</style>