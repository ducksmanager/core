<template>
  <i-bi-lightbulb-fill
    v-if="status === 'success'"
    class="ms-2"
    color="yellow"
  />
  <i-bi-extra-lightbulb-broken-fill
    v-else-if="status === 'failure'"
    class="ms-2"
    color="orange"
  />
</template>
<script setup lang="ts">
import IBiExtraLightbulbBrokenFill from "~icons/extra-icons/brokenLightbulb";

defineProps<{
  status: "success" | "failure";
}>();
</script>
