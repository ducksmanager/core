<template>
  <span>
    <img
      :alt="countrycode"
      :src="`${imagePath}/flags/${countrycode}.png`"
    > {{ publicationname }} {{ issuenumber }}
  </span>
</template>

<script>
export default {
  name: "Issue",
  props: {
    publicationcode: {type: String, required: true},
    publicationname: {type: String, required: true},
    issuenumber: {type: String, required: true}
  },
  computed: {
    imagePath: () => window.imagePath,
    countrycode() {
      return this.publicationcode.split('/')[0]
    }
  }
}
</script>

<style scoped>

</style>