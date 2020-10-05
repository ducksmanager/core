<template>
  <div v-if="l10n">
    <Menu />
    <Banner />
    <component
      :is="page"
      v-bind="$attrs"
    />
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

export default {
  name: "Site", 
  components: {
    Menu,
    Banner,
    Login,
    Footer
  },
  mixins: [l10nMixin, userMixin],
  data() {
    return this.$attrs;
  },
  computed: {
    imagePath: () => window.imagePath
  }
}
</script>

<style scoped>
  #logo {
    height: 100px;
  }
  div table {
    width: 90%;
    font-size: 15px
  }
  table tr td:nth-child(1) {
    text-align: left;
    width:1%;
  }
  table tr td:nth-child(2) {
    text-align: center;
  }
</style>