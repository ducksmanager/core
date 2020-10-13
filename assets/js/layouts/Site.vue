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
import Manage from "./Manage";

export default {
  name: "Site",
  components: {
    Menu,
    Banner,
    Content,
    Manage,
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
          .reduce((acc, attrKey) => ({...acc, [attrKey]: vm.$attrs[attrKey]}), {})
    }
  }
}
</script>

<style scoped lang="scss">
* {
  color: white;
  background-color: rgb(61, 75, 95) !important;
}

#logo_zone2 {
  padding: 45px 20px 20px 20px;
  vertical-align: top;
  min-height: 500px;
}

@media (max-width: 767px) {
  #logo_zone2 {
    background: none;
    margin-top: 40px;
  }
}
</style>