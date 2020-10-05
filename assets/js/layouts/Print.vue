<template>
  <div v-if="l10n">
    <table>
      <tr>
        <td>
          <a href="/?action=gerer"><img
            id="logo"
            alt="logo"
            :src="`${imagePath}/logo_small.png`"
          ></a>
        </td>
        <td>{{ l10n.COLLECTION_DE }} {{ username }}</td>
      </tr>
    </table>
    <Collectable v-if="type === 'collectable'" />
    <Classic v-else-if="type === 'classic'" />
  </div>
</template>

<script>
import Collectable from "../components/Collectable";
import Classic from "../components/Classic";
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
    type: {type: String, required: true}
  },
  computed: {
    imagePath: () => window.imagePath
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