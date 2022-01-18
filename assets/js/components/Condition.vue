<template>
  <span
    v-if="condition"
    :class="{'issue-condition': true, [`issue-condition-${condition.value}`]: true}"
    :style="{backgroundColor: condition.color}"
    :title="getConditionLabel(condition.dbValue)"
  />
</template>

<script>
import collectionMixin from "../mixins/collectionMixin";
import conditionMixin from "../mixins/conditionMixin";

export default {
  name: "Condition",

  mixins: [collectionMixin, conditionMixin],
  props: {
    publicationcode: {type: String, default: null},
    issuenumber: {type: String, default: null},
    value: { type: String, default: null}
  },

  computed: {
    issueInCollection() {
      return this.value ? true: this.findInCollection(this.publicationcode, this.issuenumber)
    },
    condition() {
      const vm = this
      return this.value
        ? this.conditions.find(({value}) => value === vm.value)
        : this.issueInCollection && this.conditions.find(({dbValue}) => dbValue === vm.issueInCollection.condition)
    }
  }
}
</script>

<style scoped lang="scss">

.issue-condition {
  border-radius: 50%;

  &.issue-condition-missing {
    border: 8px solid black;
  }

  &.issue-condition-bad {
    border: 8px solid red;
  }

  &.issue-condition-notsogood {
    border: 8px solid orange;
  }

  &.issue-condition-good {
    border: 8px solid #2CA77B;
  }

  &.issue-condition-possessed {
    border: 8px solid #808080;
  }

}
</style>
