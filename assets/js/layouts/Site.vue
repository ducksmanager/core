<template>
  <div v-if="l10n">
    <Menu />
    <Banner />
    <div id="logo_zone2">
      <component
        :is="page"
        v-bind="attrsWithoutId"
      />
    </div>
    <Footer />
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import userMixin from "../mixins/userMixin";
import Menu from "./Menu";
import Footer from "./Footer";
import Login from "./Login";
import Banner from "./Banner";
import Content from "./Content";

export default {
  name: "Site",
  components: {
    Menu,
    Banner,
    Content,
    Login,
    Footer
  },
  mixins: [l10nMixin, userMixin],
  data() {
    return this.$attrs;
  },
  computed: {
    attrsWithoutId() {
      const vm = this
      return Object.keys(this.$attrs).filter(attrKey => attrKey !== 'id')
          .reduce((acc, attrKey) => ({...acc, [attrKey]: vm.$attrs[attrKey] }), {})
    }
  }
}
</script>

<style scoped lang="scss">
#logo_zone2 {
  padding-left:5px;
  vertical-align: top;
}

@media (max-width: 767px) {
  #logo_zone2 {
    background: none;
    margin-top: 40px;
  }
}
</style>