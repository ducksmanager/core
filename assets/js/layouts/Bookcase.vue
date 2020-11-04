<template>
  <div v-if="l10n">
    <div v-if="$attrs['bookcase-username'] !== username">
      <h5>{{ l10n.BIBLIOTHEQUE_DE }} {{ $attrs['bookcase-username'] }}</h5>
      <ViewBookcase v-bind="attrsWithoutTab" />
    </div>
    <template v-else>
      <Menu
        :title="l10n.BIBLIOTHEQUE_COURT"
        :root-path="'/bookcase'"
        :default-path="'/show'"
        :items="[
          {path: '/show', text: l10n.BIBLIOTHEQUE_COURT},
          {path: '/options', text: l10n.BIBLIOTHEQUE_OPTIONS_COURT},
          {path: '/contributors', text: l10n.BIBLIOTHEQUE_CONTRIBUTEURS_COURT}
        ]"
      />
      <component
        :is="tab"
        v-bind="attrsWithoutTab"
      />
    </template>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import ViewBookcase from "./bookcase/ViewBookcase";
import Menu from "./Menu";
import BookcaseOptions from "./bookcase/BookcaseOptions";
import BookcaseContributors from "./bookcase/BookcaseContributors";

export default {
  name: "Bookcase",
  components: {
    ViewBookcase,
    BookcaseOptions,
    BookcaseContributors,
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
    username: () => window.username,
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