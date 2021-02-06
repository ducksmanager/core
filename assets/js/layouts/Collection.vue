<template>
  <div>
    <Menu
      :title="$t('Gérer ma collection')"
      :root-path="'/collection'"
      :default-path="'/show'"
      :items="[
        {path: '/show', text: $t('Mes numéros')},
        {path: '/account', text: $t('Mon compte')},
        {path: '/subscriptions', text: $t('Mes abonnements <sup>Nouveau !</sup>')}
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
