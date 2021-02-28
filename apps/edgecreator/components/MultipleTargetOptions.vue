<template>
  <div class="multiple-targets-options d-inline-block mt-2 p-2">
    <div class="header mt-n4 mb-1">
      <b-icon-pencil />
    </div>
    <slot />
  </div>
</template>

<script>
import { BIconPencil } from 'bootstrap-vue'

export default {
  name: 'MultipleTargetOptions',

  components: {
    BIconPencil,
  },
}
</script>

<style scoped lang="scss">
.multiple-targets-options {
  max-width: 500px;
  border: 1px solid grey;
  border-radius: 0.2rem;

  .header .b-icon {
    background: white;
  }
}
</style>
