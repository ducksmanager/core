<template>
  <span>
    <img
      class="flag"
      :alt="countryCode"
      :src="`${imagePath}/flags/${countryCode}.png`"
    >
    <slot
      v-if="countryName"
      :country-name="countryName"
    >
      {{ countryName }}
    </slot>
  </span>
</template>

<script>
export default {
  name: "Country",
  props: {
    country: {
      type: String,
      default: null
    },
    publicationCode: {
      type: String,
      default: null
    },
    countryName: {
      type: String,
      default: null
    }
  },
  computed: {
    countryCode() {
      return this.country || this.publicationCode.split('/')[0]
    }
  }
}
</script>

<style scoped>
  .flag {
    margin-bottom: 5px;
  }
</style>