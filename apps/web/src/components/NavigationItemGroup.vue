<template>
  <li>
    <span :v-b-toggle="collapseId" class="d-flex align-items-center"
      ><i :class="icon" />
      <slot name="text" />
    </span>
    <b-collapse :id="collapseId" :model-value="true">
      <ul class="sub-menu">
        <slot name="items" />
      </ul>
    </b-collapse>
  </li>
</template>

<script setup lang="ts">
const { icon } = defineProps<{
  icon: string;
}>();

const collapseId = computed(() => `collapse-${icon}`);
</script>
