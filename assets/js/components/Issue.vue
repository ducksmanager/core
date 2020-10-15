<template>
  <a
    :class="{ clickable }"
    :href="`/collection/show/${publicationcode}#${issuenumber}`"
  >
    <span v-if="issueInCollection">{{ issueInCollection.condition }}</span>
    <img
      :alt="countrycode"
      :src="`${imagePath}/flags/${countrycode}.png`"
    > {{ publicationname }} {{ issuenumber }}
  </a>
</template>

<script>
import collectionMixin from "../mixins/collectionMixin";
import {mapState} from "vuex";

export default {
  name: "Issue",
  mixins: [collectionMixin],
  props: {
    publicationcode: {type: String, required: true},
    publicationname: {type: String, required: true},
    issuenumber: {type: String, required: true},
    clickable: { type: Boolean, default: false }
  },
  computed: {
    ...mapState("collection", ["collection"]),
    imagePath: () => window.imagePath,
    countrycode() {
      return this.publicationcode.split('/')[0]
    },

    issueInCollection() {
      return this.findInCollection(this.publicationcode, this.issuenumber)
    }
  },
}
</script>

<style scoped lang="scss">
  a {
    pointer-events: none;

    &.clickable {
      pointer-events: initial;
    }
  }
</style>