<template>
  <span v-if="values.length > 1 && !edit">
    {{ $t('Multiple values.') }}
    <b-btn
      size="sm"
      pill
      @click="
        edit = true
        $emit('change', values[0])
      "
      >{{ $t('Edit') }}</b-btn
    >
  </span>
  <span v-else><slot /></span>
</template>
<script>
export default {
  name: 'ConfirmEditMultipleValues',
  props: {
    values: {
      type: Array,
      required: true,
    },
  },

  data: () => ({
    edit: false,
  }),
}
</script>
