<template>
  <div v-if="l10n">
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
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import ViewBookcase from "./bookcase/ViewBookcase";
import Menu from "./Menu";
import BookcaseOptions from "./bookcase/BookcaseOptions";

export default {
  name: "Bookcase",
  components: {
    ViewBookcase,
    BookcaseOptions,
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