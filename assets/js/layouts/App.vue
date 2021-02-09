<template>
  <component
    :is="component"
    v-bind="props"
  />
</template>

<script>
import Print from "./Print";
import EdgeProgress from "./EdgeProgress";
import Site from "./Site";
import BookstoresAdmin from "./BookstoresAdmin";

export default {
  name: "App",
  components: {
    BookstoresAdmin,
    EdgeProgress,
    Print,
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
