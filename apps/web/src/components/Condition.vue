<template>
  <span
    v-if="currentCondition"
    class="issue-condition"
    :class="{
      [`issue-condition-${currentCondition!.dbValue}`]: true,
    }"
    :style="{ backgroundColor: currentCondition!.color }"
    :title="currentCondition!.label"
  />
  <span v-else class="issue-condition" />
</template>

<script setup lang="ts">
import type { issue_condition } from "~prisma-clients/extended/dm.extends";
const {
  issuenumber = null,
  publicationcode = null,
  value = undefined,
  isPublic = false,
} = defineProps<{
  publicationcode?: string;
  issuenumber?: string;
  value?: issue_condition;
  isPublic?: boolean;
}>();

const store = $computed(() => (isPublic ? publicCollection() : collection()));

const { conditions } = useCondition();
const currentCondition = $computed(() => {
  if (value !== undefined) {
    return (
      conditions.find(
        ({ dbValue: conditionValue }) =>
          (value?.toString() || null) === conditionValue,
      ) || conditions.find(({ dbValue }) => dbValue === null)!
    );
  } else if (publicationcode && issuenumber) {
    const issueInCollection = store.findInCollection(
      publicationcode,
      issuenumber,
    );
    return (
      (issueInCollection &&
        conditions.find(
          ({ dbValue }) => dbValue === issueInCollection.condition,
        )) ||
      undefined
    );
  }
  return conditions.find(({ dbValue }) => dbValue === null);
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
