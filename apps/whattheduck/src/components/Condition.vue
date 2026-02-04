<template>
  <span :class="`dm-condition-background ${getConditionDbEnValue(value)} ${noMargin ? 'ion-no-margin' : ''}`" />
</template>
<script setup lang="ts">
import type { issue_condition } from '~prisma-schemas/schemas/dm';

const { getConditionDbEnValue } = useCondition();

defineProps<{
  value: issue_condition | null;
  noMargin?: boolean;
}>();
</script>
<style lang="scss" scoped>
span {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  display: inline-block;
  border-radius: 50%;
}
</style>
