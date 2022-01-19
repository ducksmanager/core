<template>
  <div v-if="l10nRoutes">
    <LeftPanel />
    <SwitchLocale />
    <Banner :classes="{'d-none d-md-flex': true}" />
    <div id="logo_zone2">
      <h2 v-if="innerTitle">
        {{ innerTitle }}
      </h2>
      <component
        :is="page"
        v-bind="attrsWithoutId"
      />
    </div>
    <Footer />
  </div>
</template>

<script>
import LeftPanel from "./LeftPanel";
import Footer from "./Footer";
import Login from "./Login";
import Banner from "./Banner";
import InducksImport from "./InducksImport";
import Stats from "./Stats";
import Bookcase from "./Bookcase";
import Expand from "./Expand";
import Bookstores from "./Bookstores";
import PrintPresentation from "./PrintPresentation";
import Welcome from "./Welcome";
import Forgot from "./Forgot";
import Signup from "./Signup";
import Collection from "./Collection";
import SwitchLocale from "./SwitchLocale";
import { mapState } from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "Site",
  components: {
    SwitchLocale,
    Banner,
    Bookcase,
    Bookstores,
    Collection,
    Expand,
    Footer,
    Forgot,
    InducksImport,
    LeftPanel,
    Login,
    PrintPresentation,
    Signup,
    Stats,
    Welcome,
  },
  props: {
    page: { type: String, required: true },
    title: { type: String, default: null },
    innerTitle: { type: String, default: null },
  },
  data() {
    return this.$attrs;
  },
  computed: {
    ...mapState(l10n, ['l10nRoutes']),
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
