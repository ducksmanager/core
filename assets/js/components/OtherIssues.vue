<template>
  <span v-if="number > 1">
    {{ l10n.ET }} {{ number - 1 }}
    <template v-if="number > 2">
      {{ l10n[l10KeyMultiple] }}
    </template>
    <template v-else>
      {{ l10n[l10KeySingle] }}
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
    l10KeySingle: {
      type: String,
      default: 'NEWS_AUTRE_NUMERO'
    },
    l10KeyMultiple: {
      type: String,
      default: 'NEWS_AUTRES_NUMEROS'
    }
  }
}
</script>

<style scoped>

</style>