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
  }
}
</script>

<style scoped>

</style>
