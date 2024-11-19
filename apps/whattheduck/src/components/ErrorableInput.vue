<template>
  <ion-input
    v-model="model.value"
    :type="type"
    :class="{
      'ion-valid': model.isValid,
      'ion-invalid': model.isInvalid,
      'ion-touched': model.isTouched,
    }"
    :error-text="model.errorText"
    :aria-label="label"
    :placeholder="label"
    @ion-blur="model.isTouched = false"
  >
    <slot />
  </ion-input>
</template>

<script lang="ts" setup>
defineProps<{
  type: 'text' | 'password';
  label: string;
}>();

defineSlots<{
  default: [];
}>();

const model = defineModel<{
  value: string;
  isValid: boolean;
  isInvalid: boolean;
  isTouched: boolean;
  errorText?: string;
}>({
  required: true,
});
</script>