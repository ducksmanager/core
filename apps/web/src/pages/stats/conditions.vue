<template>
  <LinkToCollectionIfNoIssue />
  <ConditionsComponent
    :conditions="conditionsWithoutMissing"
    :number-per-condition="numberPerCondition"
  />
</template>

<script setup lang="ts">
const { loadCollection, numberPerCondition } = collection();

const { conditionsWithoutMissing } = useCondition();

void loadCollection();
</script>
