<template>
  <span v-if="issueInCollection">{{ issueInCollection.condition }}</span>
</template>

<script>
import collectionMixin from "../mixins/collectionMixin";

export default {
  name: "Condition",

  mixins: [collectionMixin],
  props: {
    publicationcode: {type: String, required: true},
    issuenumber: {type: String, required: true}
  },

  computed: {
    issueInCollection() {
      return this.findInCollection(this.publicationcode, this.issuenumber)
    }
  }
}
</script>

<style scoped>

</style>