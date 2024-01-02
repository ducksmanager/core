<template>
  <LinkToCollectionIfNoIssue />
  <ConditionsComponent
    :conditions="conditionsWithoutMissing"
    :number-per-condition="numberPerCondition"
  />
</template>

<script setup lang="ts">
import condition from "~/composables/useCondition";

const { loadCollection, numberPerCondition } = collection();

const conditionsWithoutMissing = condition()
  .conditions.filter(({ dbValue }) => dbValue !== "missing")
  .map(({ dbValue, color, text }) => ({
    dbValue: dbValue as string,
    color,
    text,
  }));

loadCollection();
</script>
