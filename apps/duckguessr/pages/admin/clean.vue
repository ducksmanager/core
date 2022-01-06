<template>
  <b-container fluid class="p-4 bg-dark">
    <b-row>
      <b-col cols="12">
        <b-select v-model="selectedDataset">
          <b-select-option value="published-fr-recent">
            published-fr-recent ({{ leftToMaintainImageCount }} left to
            maintain)
          </b-select-option>
        </b-select>
        <div v-if="validatedImageCount !== null">
          {{ validatedImageCount }} images from this dataset can currently be
          seen on Duckguessr, {{ leftToMaintainImageCount }} are left to
          maintain.
        </div>
        Cliquez sur les images qui ne doivent pas être utilisées dans
        Duckguessr:
        <ul>
          <li>Images qui ne contiennent pas de dessin</li>
          <li>Images sur lesquelles le nom du dessinateur est inscrit</li>
        </ul>
      </b-col>
    </b-row>
    <b-row>
      <b-col
        v-for="{ sitecodeUrl, url } in entryurlsPendingMaintenanceWithUrls"
        :key="sitecodeUrl"
        :class="{
          'd-flex': true,
          'align-items-center': true,
          invalid: invalidSitecodeUrls.includes(sitecodeUrl),
        }"
        col
        cols="1"
        @click="toggleEntryurl(sitecodeUrl)"
      >
        <b-img thumbnail fluid :src="url" />
      </b-col>
    </b-row>
    <b-btn variant="success" @click="submitInvalidations()">OK</b-btn>
  </b-container>
</template>

<script lang="ts">
import { computed, onMounted, ref, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'Clean',
  setup() {
    const { $axios } = useContext()

    let entryurlsPendingMaintenance: Array<String>
    const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
    const maintainedEntryurlsCount = ref(null as Array<any> | null)
    const selectedDataset = ref('published-fr-recent' as String)
    const invalidSitecodeUrls = ref([] as Array<string>)

    onMounted(async () => {
      const maintenanceData = await $axios.$get(
        `/api/admin/maintenance?dataset=${selectedDataset.value}`
      )
      entryurlsPendingMaintenance = maintenanceData.entryurlsToMaintain
      maintainedEntryurlsCount.value = maintenanceData.maintainedEntryurlsCount
      entryurlsPendingMaintenanceWithUrls.value =
        entryurlsPendingMaintenance.map((sitecodeUrl: String) => ({
          sitecodeUrl,
          url: `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${sitecodeUrl}`,
        }))
    })

    return {
      selectedDataset,
      entryurlsPendingMaintenanceWithUrls,
      invalidSitecodeUrls,
      maintainedEntryurlsCount,
      leftToMaintainImageCount: computed(() =>
        maintainedEntryurlsCount.value
          ? maintainedEntryurlsCount.value.find(
              ({ decision }) => decision === null
            ).count
          : null
      ),
      validatedImageCount: computed(() =>
        maintainedEntryurlsCount.value
          ? maintainedEntryurlsCount.value.find(
              ({ decision }) => decision === 0
            ).count
          : null
      ),
      toggleEntryurl(sitecodeUrl: string) {
        if (invalidSitecodeUrls.value.includes(sitecodeUrl)) {
          invalidSitecodeUrls.value.splice(
            invalidSitecodeUrls.value.indexOf(sitecodeUrl),
            1
          )
        } else {
          invalidSitecodeUrls.value.push(sitecodeUrl)
        }
      },
      async submitInvalidations() {
        await $axios.$post(`/api/admin/maintenance`, {
          entryurlsPendingMaintenance,
          invalidSitecodeUrls: invalidSitecodeUrls.value,
        })
        window.location.reload()
      },
    }
  },
  head() {
    return {
      title: 'Duckguessr - image maintenance',
    }
  },
}
</script>

<style scoped lang="scss">
.col {
  border: 1px solid green;
  cursor: pointer;

  &.invalid {
    border: 1px solid red;
  }

  img {
    height: initial;
  }
}
</style>
