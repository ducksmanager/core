<template>
  <div>
    <b-alert
      v-if="errors[id]"
      show
      variant="danger"
    >
      {{ $t(errors[id]) }}
    </b-alert>
    <slot />
  </div>
</template>

<script>
import { mapState } from "pinia";
import {BAlert} from "bootstrap-vue";
import { form } from "../stores/form";

export default {
  name: "Errorable",
  components: {
    BAlert
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },

  computed: {
    ...mapState(form, ["errors"])
  }
}
</script>

<style scoped lang="scss">
input {
  margin-top: 8px !important;
}
.alert {
  margin-top: 1rem;
  margin-bottom: 0;

  + input {
    margin-top: 0 !important;
  }
}
</style>
