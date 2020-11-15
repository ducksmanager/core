<template>
  <span v-if="number > 1">
    {{ l10n.ET }} {{ number - 1 }}
    <template v-if="number > 2">
      {{ l10n.NEWS_AUTRES_NUMEROS }}
    </template>
    <template v-else>
      {{ l10n.NEWS_AUTRE_NUMERO }}
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
    }
  }
}
</script>

<style scoped>

</style>