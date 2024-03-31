<template>
  <LinkToCollectionIfNoIssue />
  <ConditionsComponent
    :conditions="conditionsWithoutMissing"
    :number-per-condition="numberPerCondition"
  />
  <ConditionsComponent
    :conditions="conditionsWithoutMissing"
    :number-per-condition="numberPerCondition"
  />
</template>

<script setup lang="ts">
const { loadCollection, numberPerCondition } = collection();

const conditionsWithoutMissing = useCondition()
  .conditions.filter(({ dbValue }) => dbValue !== "missing")
  .map(({ dbValue, color, text }) => ({
    dbValue: dbValue as string,
    color,
    text,
  }));

loadCollection();
</script>
