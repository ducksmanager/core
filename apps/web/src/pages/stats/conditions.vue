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

const { conditionsWithoutMissing } = useCondition();

loadCollection();
</script>
