<template>
  <b-button
    :key="description"
    :pressed="isPressed"
    class="mt-1 mx-2 d-inline-flex border rounded-pill align-items-center"
    toggle-class=" rounded-pill"
    variant="light"
    text-variant="secondary"
    @click.stop="isPressed = !isPressed"
  >
    <component :is="icon" v-if="icon" class="me-2" />{{ description
    }}<i-bi-check v-if="isPressed" class="ms-2" color="green" />
  </b-button>
</template>
<script setup lang="ts">
const isPressed = defineModel<boolean>("pressed", { required: true });

const { description, icon = undefined } = defineProps<{
  description: string;
  icon?: Component;
}>();
</script>