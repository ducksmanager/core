<template>
  <div v-if="collection && countryNames && publicationNames">
    <div v-for="country in countryCodes">
      <div class="country">{{ countryNames[country] }}</div>
      <div v-for="publicationCode in publicationCodesOfCountry(country)">
        <u>{{publicationNames[publicationCode] || publicationCode}}</u>
        {{ issuesOfPublicationCode(publicationCode) }}
        <br />
      </div>
    </div>
  </div>
</template>
<script>
  import collectionMixin from "../mixins/collectionMixin";

  export default {
    mixins: [collectionMixin],
    computed: {
      countryCodes() {
        return [...new Set(this.collection.map(i => i.country))]
      },
      publicationCodes() {
        return [...new Set(this.collection.map(i => `${i.country}/${i.magazine}`))]
      }
    },
    methods: {
      publicationCodesOfCountry(countryCode) {
        const vm = this
        return this.publicationCodes.filter(publicationCode => publicationCode.split('/')[0] === countryCode)
          .sort((a, b) => !vm.publicationNames[b] ? 1 : vm.publicationNames[a] < vm.publicationNames[b] ? - 1 : vm.publicationNames[a] > vm.publicationNames[b] ? 1 : 0)
      },
      issuesOfPublicationCode(publicationCode) {
        return this.collection.filter(i => publicationCode === `${i.country}/${i.magazine}`).map(i => i.issueNumber).join(', ')
      }
    }
  }
</script>

<style>
.country {
  font-weight: bold;
  font-style: italic;
  margin: 10px 0 5px 0;
}
</style>