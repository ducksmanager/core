<template>
  <a
    :class="{ clickable }"
    :href="`/collection/show/${publicationcode}#${issuenumber}`"
  >
    <span v-if="issueInCollection && !hideCondition">{{ issueInCollection.condition }}</span>
    <Publication
      :publicationcode="publicationcode"
      :publicationname="publicationname"
    /> {{ issuenumber }}
  </a>
</template>

<script>
import collectionMixin from "../mixins/collectionMixin";
import {mapState} from "vuex";
import Publication from "./Publication";

export default {
  name: "Issue",
  components: {Publication},
  mixins: [collectionMixin],
  props: {
    publicationcode: {type: String, required: true},
    publicationname: {type: String, required: true},
    issuenumber: {type: String, required: true},
    clickable: { type: Boolean, default: false },
    hideCondition: { type: Boolean, default: false }
  },
  computed: {
    ...mapState("collection", ["collection"]),
    imagePath: () => window.imagePath,

    issueInCollection() {
      return this.findInCollection(this.publicationcode, this.issuenumber)
    }
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