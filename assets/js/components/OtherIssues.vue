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
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "OtherIssues",
  mixins: [l10nMixin],

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
