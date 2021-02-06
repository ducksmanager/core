<template>
  <div>
    <div v-if="$attrs['bookcase-username'] && $attrs['bookcase-username'] !== username">
      <h5><b>{{ $t('Bibliothèque DucksManager de') }} {{ $attrs['bookcase-username'] }}</b></h5>
      <ViewBookcase v-bind="attrsWithoutTab" />
    </div>
    <template v-else>
      <Menu
        :title="$t('Ma bibliothèque')"
        :root-path="'/bookcase'"
        :default-path="'/show'"
        :items="[
          {path: '/show', text: $t('Ma bibliothèque')},
          {path: '/options', text: $t('Options de la bibliothèque')},
          {path: '/contributors', text: $t('Contributeurs')}
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
