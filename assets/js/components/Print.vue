<template>
  <div v-if="l10n">
    <Collectable v-if="printType === 'collectable'"/>
    <Classic v-else-if="printType === 'classic'"/>
  </div>
</template>

<script>
import Collectable from "./Collectable";
import Classic from "./Classic";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Print",
  props: {
    printType: String
  },
  mixins: [l10nMixin],
  components: {
    Collectable,
    Classic
  }
}
</script>

<style scoped>

</style>