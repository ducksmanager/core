<template>
  <div v-if="l10n">
    <Menu
      :title="l10n.GERER_COLLECTION"
      :root-path="'/collection'"
      :default-path="'/show'"
      :items="[
        {path: '/show', text: l10n.GESTION_NUMEROS_COURT},
        {path: '/account', text: l10n.GESTION_COMPTE_COURT}
      ]"
    />
    <component
      :is="tab"
      v-bind="attrsWithoutTab"
    />
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import Menu from "./Menu";
import Account from "./Account";
import Manage from "./Manage";

export default {
  name: "Collection",
  components: {
    Account,
    Manage,
    Menu
  },
  mixins: [l10nMixin],
  props: {
    tab: {
      type: String,
      required: true
    }
  },
  computed: {
    attrsWithoutTab() {
      const vm = this
      return Object.keys(this.$attrs).filter(attrKey => attrKey !== 'tab')
        .reduce((acc, attrKey) => ({...acc, [attrKey]: vm.$attrs[attrKey]}), {})
    }
  }
}
</script>

<style scoped lang="scss">
</style>