<template>
  <component :is="component" v-bind="props" />
</template>

<script>
import Print from "./Print";
import EdgeProgress from "./EdgeProgress";

export default {
  name: "App.vue",
  data() {
    const {component, props} = this.$attrs
    return {
      component,
      props,
    }
  },
  components: {
    Print,
    EdgeProgress
  }
}
</script>

<style scoped>

</style>