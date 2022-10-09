<template>
  <span
    v-if="currentCondition"
    class="issue-condition"
    :class="{
      [`issue-condition-${currentCondition.value}`]: true,
    }"
    :style="{ backgroundColor: currentCondition.color }"
    :title="getConditionLabel(currentCondition.dbValue)"
  />
</template>

<script setup>
import { condition } from "~/composables/condition";
import { collection } from "~/stores/collection";
const { publicationcode, issuenumber, value } = defineProps({
  publicationcode: { type: String, default: null },
  issuenumber: { type: String, default: null },
  value: { type: String, default: null },
});

const { conditions, getConditionLabel } = condition();
const currentCondition = $computed(() => {
  if (value) {
    return conditions.find(
      ({ value: conditionValue }) => value === conditionValue
    );
  } else {
    const issueInCollection = collection().findInCollection(
      publicationcode,
      issuenumber
    );
    return (
      issueInCollection &&
      conditions.find(({ dbValue }) => dbValue === issueInCollection.condition)
    );
  }
});
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
    border: 8px solid #2ca77b;
  }

  &.issue-condition-possessed {
    border: 8px solid #808080;
  }
}
</style>
