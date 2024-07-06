<template>
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" :class="arcPath ? 'none' : fillClass" />
    <path v-if="arcPath" :d="arcPath" :class="fillClass" />
  </svg>
</template>
<script setup lang="ts">
import type { PartInfo } from '~dm-types/SimpleIssue';
import type { issue_condition } from '~prisma-clients/extended/dm.extends';

const { conditions } = useCondition();

const props = defineProps<{
  value?: issue_condition;
  noMargin?: boolean;
  partInfo?: PartInfo;
}>();

const fillClass = computed(
  () =>
    `dm-condition-background ${conditions.find((condition) => condition.dbValue === props.value)?.dbEnValue} ${props.noMargin ? 'ion-no-margin' : ''}`,
);

const arcPath = computed(() => {
  if (!props.partInfo || props.partInfo.estimatedpanels >= props.partInfo.total_estimatedpanels) {
    return null;
  }
  // const partAngle = 360 / props.partInfo.totalParts;
  const partAngle = 0;
  const ratio = props.partInfo.estimatedpanels / props.partInfo.total_estimatedpanels;
  const fillAngle = 360 * ratio;

  const startAngle = (parseInt(props.partInfo.part) - 1) * partAngle;
  const endAngle = startAngle + fillAngle;

  const largeArcFlag = fillAngle > 180 ? 1 : 0;
  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;

  const startX = 50 + 45 * Math.cos(startRadians);
  const startY = 50 + 45 * Math.sin(startRadians);
  const endX = 50 + 45 * Math.cos(endRadians);
  const endY = 50 + 45 * Math.sin(endRadians);

  return `M50,50 L${startX},${startY} A45,45 0 ${largeArcFlag},1 ${endX},${endY} Z`;
});
</script>
<style lang="scss" scoped>
svg {
  width: 14px;
  height: 14px;
  margin-right: 8px;
}
</style>
