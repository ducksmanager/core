<template>
  <component :is="component" ref="root" v-bind="props" />
</template>

<script>
import Print from "./Print";
import BookstoresAdmin from "./admin/BookstoresAdmin";
import EdgeProgress from "./admin/EdgeProgress";
import Site from "./Site";
import Privacy from "./Privacy";

const { l10n: l10nStore } = require("../stores/l10n");

import { ref, onMounted } from "vue";

export default {
  name: "App",
  components: {
    BookstoresAdmin,
    EdgeProgress,
    Print,
    Privacy,
    Site,
  },
  setup() {
    const component = ref(null),
      props = ref({}),
      root = ref(null),
      { loadL10n } = l10nStore();
    onMounted(async () => {
      for (const { name, value } of root.value.parentElement.attributes) {
        if (name === "component") {
          component.value = value;
        } else {
          props.value[name] = value;
        }
      }
      await loadL10n();
    });

    return {
      root,
      component,
      props,
    };
  },
  // data() {
  //   const {component, props} = this.$attrs
  //   return {
  //     component,
  //     props,
  //   }
  // },
  // async mounted() {
  //   await this.loadL10n()
  // },
};
</script>

<style scoped>

</style>
