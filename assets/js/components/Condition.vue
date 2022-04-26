<template>
  <span
    v-if="currentCondition"
    :class="{'issue-condition': true, [`issue-condition-${currentCondition.value}`]: true}"
    :style="{backgroundColor: currentCondition.color}"
    :title="getConditionLabel(currentCondition.dbValue)"
  />
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
  publicationcode: {type: String, default: null},
  issuenumber: {type: String, default: null},
  value: {type: String, default: null}
})
import {collection} from "../composables/collection";
import {condition} from "../composables/condition";

const {conditions, getConditionLabel} = condition()
const {findInCollection} = collection()

const issueInCollection = computed(() =>
    props.value ? true : findInCollection(props.publicationcode, props.issuenumber)
)

const currentCondition = computed(() =>
    props.value
        ? conditions.find(({value}) => value === props.value)
        : issueInCollection.value && conditions.find(({dbValue}) => dbValue === issueInCollection.value.condition))
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
