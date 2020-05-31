<template>
  <b-row>
    <b-col sm="2">
      <label :for="id">{{ label }}</label>
    </b-col>
    <b-col sm="3">
      <slot />
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'FormRow',
  props: {
    label: { type: String, required: true },
    id: { type: String, required: true }
  }
}
</script>

<style scoped></style>
