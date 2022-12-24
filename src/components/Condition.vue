<template>
  <span
    v-if="currentCondition"
    class="issue-condition"
    :class="{
      [`issue-condition-${currentCondition!.value}`]: true,
    }"
    :style="{ backgroundColor: currentCondition!.color }"
    :title="currentCondition!.label"
  />
  <span v-else class="issue-condition" />
</template>

<script setup lang="ts">
import condition from "~/composables/condition";
import { collection } from "~/stores/collection";
import { issue_condition } from "~prisma_clients/client_dm";
const {
  issuenumber = null,
  publicationcode = null,
  value = undefined,
} = defineProps<{
  publicationcode?: string;
  issuenumber?: string;
  value?: issue_condition;
}>();

const { conditions } = condition();
const currentCondition = $computed(() => {
  if (value !== undefined) {
    return (
      conditions.find(
        ({ value: conditionValue }) =>
          (value?.toString() || null) === conditionValue
      ) || conditions.find(({ value }) => value === null)!
    );
  } else if (publicationcode && issuenumber) {
    const issueInCollection = collection().findInCollection(
      publicationcode,
      issuenumber
    );
    return (
      (issueInCollection &&
        conditions.find(
          ({ dbValue }) => dbValue === issueInCollection.condition
        )) ||
      undefined
    );
  }
  return conditions.find(({ value }) => value === null);
});
</script>

<style scoped lang="scss">
.issue-condition {
  border: 8px solid transparent;
  border-radius: 50%;

  &.issue-condition-null {
    border: 8px solid black;
  }

  &.issue-condition-mauvais {
    border: 8px solid red;
  }

  &.issue-condition-moyen {
    border: 8px solid orange;
  }

  &.issue-condition-bon {
    border: 8px solid #2ca77b;
  }

  &.issue-condition-indefini {
    border: 8px solid #808080;
  }
}
</style>
