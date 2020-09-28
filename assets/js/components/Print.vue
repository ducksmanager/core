<template>
  <Collectable v-if="printType === 'collectable'"/>
  <Classic v-else-if="printType === 'classic'"/>
</template>

<script>
import Collectable from "./Collectable";
import Classic from "./Classic";

export default {
  name: "Print",
  props: {
    printType: String
  },
  components: {
    Collectable,
    Classic
  }
}
</script>

<style scoped>

</style>