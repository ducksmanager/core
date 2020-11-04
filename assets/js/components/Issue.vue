<template>
  <a
    :class="{ clickable }"
    :href="`/collection/show/${publicationcode}#${issuenumber}`"
  >
    <Condition
      v-if="!hideCondition"
      :publicationcode="publicationcode"
      :issuenumber="issuenumber"
    />
    <Publication
      :publicationcode="publicationcode"
      :publicationname="publicationname"
    /> {{ issuenumber }}
  </a>
</template>

<script>
import Publication from "./Publication";
import Condition from "./Condition";

export default {
  name: "Issue",
  components: {Condition, Publication},
  props: {
    publicationcode: {type: String, required: true},
    publicationname: {type: String, required: true},
    issuenumber: {type: String, required: true},
    clickable: { type: Boolean, default: false },
    hideCondition: { type: Boolean, default: false }
  },
  computed: {
    imagePath: () => window.imagePath,
  },
}
</script>

<style scoped lang="scss">
  a {
    color: lightgrey;
    pointer-events: none;
    border-bottom: none;

    &.clickable {
      pointer-events: initial;
      border-bottom: initial;
    }
  }
</style>