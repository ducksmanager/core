<template>
  <component
    :is="component"
    v-bind="props"
  />
</template>

<script>
import Print from "./Print";
import BookstoresAdmin from "./admin/BookstoresAdmin";
import EdgeProgress from "./admin/EdgeProgress";
import Site from "./Site";
import Privacy from "./Privacy";
import { mapActions } from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "App",
  components: {
    BookstoresAdmin,
    EdgeProgress,
    Print,
    Privacy,
    Site
  },
  data() {
    const {component, props} = this.$attrs
    return {
      component,
      props,
    }
  },
  async mounted() {
    await this.loadL10n()
  },
  methods: {
    ...mapActions(l10n, ['loadL10n'])
  }
}
</script>

<style scoped>

</style>
