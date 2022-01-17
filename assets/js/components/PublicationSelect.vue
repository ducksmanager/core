<template>
  <div>
    <b-select
      v-model="currentCountryCode"
      :options="countryNames"
      required
    />
    <b-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      name="publicationCode"
      required
      :options="publicationNamesForCurrentCountry"
      @input="$emit('input', currentPublicationCode)"
    />
    <b-button
      v-if="!noButton"
      :disabled="!currentPublicationCode"
      :href="$r(`/collection/show/{publicationCode:${currentPublicationCode}}`)"
    >
      {{ $t('OK') }}
    </b-button>
  </div>
</template>

<script>
import {mapActions, mapState} from "pinia";
import l10nMixin from "../mixins/l10nMixin";
import {BButton, BFormSelect} from "bootstrap-vue-3";
import { coa } from "../stores/coa";

export default {
  name: "PublicationSelect",

  components: {
    BSelect: BFormSelect,
    BButton
  },

  mixins: [l10nMixin],

  props: {
    noButton: {
      type: Boolean,
      default: false
    },
    initialCountryCode: {
      type: String,
      default: null
    },
    initialPublicationCode: {
      type: String,
      default: null
    }
  },
  emits: ['input'],

  data: function() {
    return {
      currentCountryCode: this.initialCountryCode,
      currentPublicationCode: this.initialPublicationCode,
    }
  },

  computed: {
    ...mapState(coa, ["countryNames", "publicationNames", "publicationNamesFullCountries"]),
    publicationNamesForCurrentCountry() {
      const vm = this
      return this.publicationNamesFullCountries.includes(this.currentCountryCode)
        ? Object.keys(this.publicationNames)
          .filter(publicationCode =>
            new RegExp(`^${vm.currentCountryCode}/`).test(publicationCode)
          ).map(publicationCode => ({
            text: vm.publicationNames[publicationCode],
            value: publicationCode
          }))
          .sort(({text: text1}, {text: text2}) => text1.localeCompare(text2))
        : []
    }
  },

  watch: {
    currentCountryCode: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.fetchPublicationNamesFromCountry(this.currentCountryCode)
        }
      }
    }
  },

  mounted() {
    this.fetchCountryNames()
  },

  methods: {
    ...mapActions(coa, ["fetchCountryNames", "fetchPublicationNamesFromCountry"]),
  }
}
</script>

<style scoped>

</style>
