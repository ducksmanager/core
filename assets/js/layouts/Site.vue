<template>
  <div v-if="l10n">
    <LeftPanel />
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
import LeftPanel from "./LeftPanel";
import Footer from "./Footer";
import Login from "./Login";
import Banner from "./Banner";
import Manage from "./Manage";
import InducksImport from "./InducksImport";
import Stats from "./Stats";
import Bookcase from "./Bookcase";
import Expand from "./Expand";
import Bookstores from "./Bookstores";
import PrintPresentation from "./PrintPresentation";

export default {
  name: "Site",
  components: {
    Banner,
    Bookcase,
    Bookstores,
    Expand,
    Footer,
    InducksImport,
    LeftPanel,
    Login,
    Manage,
    PrintPresentation,
    Stats,
  },
  mixins: [l10nMixin, userMixin],
  props: {
    page: { type: String, required: true }
  },
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
  min-height: calc(100vh - 105px);
}

@media (max-width: 767px) {
  #logo_zone2 {
    background: none;
    min-height: calc(100vh - 125px);
  }
}
</style>