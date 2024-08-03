<template>
  <template v-if="issue.estimationMin && issue.estimationMax"
    ><template v-if="issue.estimationMax === issue.estimationMin">{{
      t("Environ {0} €", [issue.estimationMin])
    }}</template>
    <template v-else>{{
      t("Entre {0} et {1} €", [issue.estimationMin, issue.estimationMax])
    }}</template></template
  ><template v-else-if="issue.estimationMin">
    {{ t("Plus de {0} €", [issue.estimationMin]) }} </template
  ><template v-else>
    {{ t("Moins de {0} €", [issue.estimationMax]) }}
  </template>
</template>
<script setup lang="ts">
import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa";

defineProps<{
  issue: Pick<inducks_issuequotation, "estimationMin" | "estimationMax"> & {
    estimation: number;
  };
}>();

const { t } = useI18n();
</script>