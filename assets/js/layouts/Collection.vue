<template>
  <div>
    <Menu
      :title="l10n.GERER_COLLECTION"
      :root-path="'/collection'"
      :default-path="'/show'"
      :items="[
        {path: '/show', text: l10n.GESTION_NUMEROS_COURT},
        {path: '/account', text: l10n.GESTION_COMPTE_COURT},
        {path: '/subscriptions', text: l10n.GESTION_ABONNEMENTS_COURT}
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
import Account from "./collection/Account";
import Manage from "./collection/Manage";
import Subscriptions from "./collection/Subscriptions";

export default {
  name: "Collection",
  components: {
    Account,
    Manage,
    Menu,
    Subscriptions
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