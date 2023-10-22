<template>
  <LinkToCollectionIfNoIssue />
  <ConditionsComponent :conditions="conditionsWithoutMissing" />
</template>

<script setup lang="ts">
import condition from "~/composables/useCondition";
import { collection as collectionStore } from "~/stores/collection";

const conditionsWithoutMissing = condition().conditions.filter(
  ({ dbValue }) => dbValue !== "missing",
);

collectionStore().loadCollection();
</script>
