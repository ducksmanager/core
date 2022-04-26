<template>
  <div>
    <Menu
      :title="$t('Gérer ma collection')"
      :root-path="'/collection'"
      :default-path="'/show'"
      :items="items"
    />
    <component
      :is="tab"
      v-bind="attrsWithoutTab"
    />
  </div>
</template>

<script>
import Menu from "./Menu";
import Account from "./collection/Account";
import Duplicates from "./collection/Duplicates";
import Manage from "./collection/Manage";
import Subscriptions from "./collection/Subscriptions";
import { mapState } from "pinia";
import {collection} from "../composables/collection";
import subscriptionMixin from "../mixins/subscriptionMixin";
const { collection: collectionStore } = require('../stores/collection');

export default {
  name: "Collection",
  components: {
    Account,
    Duplicates,
    Manage,
    Menu,
    Subscriptions
  },
  mixins: [subscriptionMixin],
  props: {
    tab: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      items: [
        {path: '/show', text: this.total == null ? this.$t('Mes numéros') : this.$t('Mes numéros ({0})', [this.total])},
        {
          path: '/duplicates',
          text: this.totalUniqueIssues == null ? this.$t('Mes numéros en double') : this.$t('Mes numéros en double ({0})', [this.total - this.totalUniqueIssues])
        },
        {
          path: '/subscriptions',
          text: this.subscriptions == null ? this.$t('Mes abonnements') : this.$t('Mes abonnements ({0})', [this.subscriptions.length])
        },
        {path: '/account', text: this.$t('Mon compte')}
      ]
    }
  },
  computed: {
    ...mapState(collection, ["subscriptions", "total", "totalUniqueIssues"]),
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
