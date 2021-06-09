<template>
  <div>
    <Menu
      :title="$t('Gérer ma collection')"
      :root-path="'/collection'"
      :default-path="'/show'"
      :items="[
        {path: '/show', text: total == null ? $t('Mes numéros') : $t('Mes numéros ({0})', [total])},
        {path: '/subscriptions', text: subscriptions == null ? $t('Mes abonnements') : $t('Mes abonnements ({0})', [subscriptions.length])},
        {path: '/account', text: $t('Mon compte')}
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
import { mapGetters, mapState } from "vuex";
import collectionMixin from "../mixins/collectionMixin";
import subscriptionMixin from "../mixins/subscriptionMixin";

export default {
  name: "Collection",
  components: {
    Account,
    Manage,
    Menu,
    Subscriptions
  },
  mixins: [l10nMixin, collectionMixin, subscriptionMixin],
  props: {
    tab: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState("collection", ["subscriptions"]),
    ...mapGetters("collection", ["total"]),
    attrsWithoutTab() {
      const vm = this
      return Object.keys(this.$attrs).filter(attrKey => attrKey !== 'tab')
        .reduce((acc, attrKey) => ({...acc, [attrKey]: vm.$attrs[attrKey]}), {})
    }
  },
}
</script>

<style scoped lang="scss">
</style>
