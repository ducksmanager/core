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
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Condition",

  mixins: [collectionMixin, conditionMixin, l10nMixin],
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

  &:before {
    position: absolute;
    left: 0;
    content: " ";
    width: 0;
    height: 0;
    border-radius: 50%;
    margin: 6px;
  }

  &.issue-condition-missing:before {
    border: 8px solid black;
  }

  &.issue-condition-bad:before {
    border: 8px solid red;
  }

  &.issue-condition-notsogood:before {
    border: 8px solid orange;
  }

  &.issue-condition-good:before {
    border: 8px solid #2CA77B;
  }

  &.issue-condition-possessed:before {
    border: 8px solid #808080;
  }

}
</style>
