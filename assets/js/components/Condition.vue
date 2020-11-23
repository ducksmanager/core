<template>
  <span
    v-if="condition"
    :style="{backgroundColor: condition.color}"
    :title="l10n[`ETAT_${condition.dbValue.toUpperCase()}`]"
  />
</template>

<script>
import collectionMixin from "../mixins/collectionMixin";
import conditionMixin from "../mixins/conditionMixin";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Condition",

  mixins: [collectionMixin, conditionMixin, l10nMixin],
  props: {
    publicationcode: {type: String, required: true},
    issuenumber: {type: String, required: true}
  },

  computed: {
    issueInCollection() {
      return this.findInCollection(this.publicationcode, this.issuenumber)
    },
    condition() {
      const vm = this
      return this.issueInCollection && this.conditions.find(({dbValue}) => dbValue === vm.issueInCollection.condition)
    }
  }
}
</script>

<style scoped>

span {
  border-radius: 50%;
}
</style>