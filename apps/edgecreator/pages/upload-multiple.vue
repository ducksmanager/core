<template>
  <b-container>
    <div id="cropper-wrapper">
      <vue-cropper
        ref="cropper"
        alt="Source Image"
        :view-mode="1"
        :movable="false"
        :rotatable="false"
        :scalable="false"
        :zoomable="false"
      />
    </div>
    <b-select v-model="currentCrop.country" :options="countries" @input="loadPublications" />
    <b-select
      v-show="currentCrop.country"
      v-model="currentCrop.publicationcode"
      :options="publications[currentCrop.country]"
      @input="loadIssues"
    />
    <b-select
      v-show="currentCrop.country && currentCrop.publicationcode"
      v-model="currentCrop.issuenumber"
      :options="issues[currentCrop.publicationcode]"
    />
    <b-button
      :disabled="
        !(
          currentCrop.country &&
          currentCrop.publicationcode &&
          ![null, undefined].includes(currentCrop.issuenumber)
        )
      "
      @click="addCrop"
      >Add</b-button
    >
    <b-container>
      <b-card-group deck columns>
        <b-card
          v-for="(crop, i) in crops"
          :key="i"
          no-body
          class="overflow-hidden"
          style="max-width: 300px; max-height: 300px;"
        >
          <b-row no-gutters style="height: 280px;">
            <b-col md="6" class="edge-crop" :style="{ backgroundImage: `url('${crop.url}')` }" />
            <b-col md="6">
              <b-card-body :title="crop.id">
                <b-card-text> {{ crop.publicationcode }} {{ crop.issuenumber }} </b-card-text>
              </b-card-body>
            </b-col>
          </b-row>
          <b-button pill variant="danger" @click="crops.splice(i, 1)">Supprimer</b-button>
        </b-card>
      </b-card-group>
    </b-container>
    <b-button v-if="crops.length" style="width: 100%;" variant="success" @click="uploadAll"
      >Upload</b-button
    >
  </b-container>
</template>

<script>
import Vue from 'vue'

export default {
  data: () => ({
    countries: null,
    currentCrop: {
      country: null,
      publicationcode: null,
      issuenumber: null,
    },
    crops: [],
    issues: {},
    publications: {},
  }),
  mounted() {
    this.loadCountries()
  },
  methods: {
    addCrop() {
      this.crops.push({
        ...this.currentCrop,
        data: this.$refs.cropper.getData(),
        url: this.$refs.cropper.getCroppedCanvas().toDataURL('image/jpeg'),
      })
    },
    async uploadAll() {
      const [country, magazine] = this.crops[0].publicationcode.split('/')
      await this.$axios.$post('/fs/upload-base64', {
        country,
        magazine,
        issuenumber: this.crops[0].issuenumber,
        data: this.crops[0].url,
      })
    },
    async loadCountries() {
      if (!this.countries) {
        this.countries = await this.$axios.$get(`/api/coa/list/countries/${this.$i18n.locale}`)
      }
    },
    async loadPublications() {
      const country = this.currentCrop.country
      if (!this.publications[country]) {
        Vue.set(
          this.publications,
          country,
          await this.$axios.$get(`/api/coa/list/publications/${country}`)
        )
      }
      this.currentCrop.publicationcode = null
      this.currentCrop.issuenumber = null
    },
    async loadIssues() {
      const publicationCode = this.currentCrop.publicationcode
      if (publicationCode) {
        if (!this.issues[publicationCode]) {
          Vue.set(
            this.issues,
            publicationCode,
            Object.values(await this.$axios.$get(`/api/coa/list/issues/${publicationCode}`))
          )
        }
        this.currentCrop.issuenumber = null
      }
    },
  },
}
</script>

<style scoped>
.edge-crop {
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
</style>
