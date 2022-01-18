<template>
  <span v-if="number > 1">
    {{ $t('et') }} {{ number - 1 }}
    <template v-if="number === 2">
      {{ textSingle || $t('autre numéro') }}
    </template>
    <template v-else>
      {{ textMultiple || $t('autres numéros') }}
    </template>
  </span>
</template>

<script>

export default {
  name: "OtherIssues",

  props: {
    number: {
      type: Number,
      required: true
    },
    textSingle: {
      type: String,
      default: null
    },
    textMultiple: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>

</style>
