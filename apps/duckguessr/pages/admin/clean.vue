<template>
  <b-container fluid class="p-4 bg-dark">
    <b-row>
      <b-col cols="12">
        <b-select v-model="selectedDataset">
          <b-select-option value="published-fr-recent">
            published-fr-recent
          </b-select-option>
        </b-select>
        <div v-if="validatedAndRemainingImageCount !== null">
          {{ validatedAndRemainingImageCount.ok }} images from this dataset can
          currently be seen on Duckguessr,
          {{ validatedAndRemainingImageCount.ko }}
          are left to maintain.
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
        v-for="(
          { sitecodeUrl, url, decision }, index
        ) in entryurlsPendingMaintenanceWithUrls"
        :key="sitecodeUrl"
        class="d-flex align-items-center justify-content-end flex-column"
        col
        cols="2"
      >
        <b-img thumbnail fluid :src="url" />
        <b-button-group vertical size="sm">
          <b-button
            v-for="({ variant, title }, value) in decisions"
            :key="`${sitecodeUrl}-${value}`"
            :variant="variant"
            :pressed="decision === value"
            @click="entryurlsPendingMaintenanceWithUrls[index].decision = value"
          >
            {{ title }}
          </b-button>
        </b-button-group>
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

    const decisions = {
      ok: { title: 'OK', variant: 'success' },
      shows_author: { title: 'Image contains author', variant: 'warning' },
      no_drawing: { title: "Image doesn't have a drawing", variant: 'warning' },
    }

    let entryurlsPendingMaintenance: Array<String>
    const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
    const maintainedEntryurlsCount = ref(null as Array<any> | null)
    const selectedDataset = ref('published-fr-recent' as String)

    onMounted(async () => {
      const maintenanceData = await $axios.$get(
        `/api/admin/maintenance?dataset=${selectedDataset.value}`
      )
      entryurlsPendingMaintenance = maintenanceData.entryurlsToMaintain
      maintainedEntryurlsCount.value = maintenanceData.maintainedEntryurlsCount
      entryurlsPendingMaintenanceWithUrls.value =
        entryurlsPendingMaintenance.map((data: any) => ({
          ...data,
          decision: data.decision || 'ok',
          url: `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${data.sitecodeUrl}`,
        }))
    })

    return {
      decisions,
      selectedDataset,
      entryurlsPendingMaintenanceWithUrls,
      maintainedEntryurlsCount,
      validatedAndRemainingImageCount: computed(() =>
        maintainedEntryurlsCount.value
          ? maintainedEntryurlsCount.value.reduce(
              (acc, { decision, count }) => ({
                ...acc,
                [decision === 'ok' ? 'ok' : 'ko']:
                  decision === 'ok' ? count : (acc.ko || 0) + count,
              }),
              {}
            )
          : null
      ),
      async submitInvalidations() {
        await $axios.$post(`/api/admin/maintenance`, {
          entryurlsPendingMaintenance:
            entryurlsPendingMaintenanceWithUrls.value,
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
  padding-left: 5px;
  padding-right: 5px;

  &.invalid {
    border: 1px solid red;
  }

  img {
    height: initial;
  }
}
</style>
