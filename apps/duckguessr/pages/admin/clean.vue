<template>
  <b-container fluid class="p-4 bg-dark">
    <b-row>
      <b-col cols="12">
        <b-select v-model="selectedDataset" :options="datasets" />
        <div v-if="validatedAndRemainingImageCount">
          {{ validatedAndRemainingImageCount.validated || 0 }} images from this
          dataset can currently be seen on Duckguessr,
          {{ validatedAndRemainingImageCount.not_validated || 0 }}
          are left to maintain.
        </div>
      </b-col>
    </b-row>
    <template v-if="!selectedDataset" />
    <b-row v-else-if="!entryurlsPendingMaintenanceWithUrls.length">
      Toutes les images de ce jeu de données ont été validées.
    </b-row>
    <template v-else>
      <b-row>
        <b-col cols="12">
          Cliquez sur les images qui ne doivent pas être utilisées dans
          Duckguessr:
          <ul>
            <li>Images qui ne contiennent pas de dessin</li>
            <li>Images sur lesquelles le nom du dessinateur est inscrit</li>
          </ul>
        </b-col>
        <b-col
          v-for="(
            { sitecode_url, url, decision }, index
          ) in entryurlsPendingMaintenanceWithUrls"
          :key="sitecode_url"
          class="d-flex align-items-center justify-content-end flex-column"
          col
          cols="2"
        >
          <b-img thumbnail fluid :src="url" />
          <b-button-group vertical size="sm">
            <b-button
              v-for="({ variant, title }, value) in decisions"
              :key="`${sitecode_url}-${value}`"
              :variant="variant"
              :pressed="decision === value"
              @click="
                entryurlsPendingMaintenanceWithUrls[index].decision = value
              "
            >
              {{ title }}
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
      <b-btn variant="success" @click="submitInvalidations()">OK</b-btn>
    </template>
  </b-container>
</template>

<script lang="ts">
import {
  computed,
  onMounted,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api'
import type Index from '@prisma/client'

export default {
  name: 'Clean',
  setup() {
    const { $axios } = useContext()

    const datasets = ref([] as Array<Index.dataset>)
    const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
    const validatedAndRemainingImageCount = ref(null as any)
    const selectedDataset = ref(null as string | null)

    const decisions = computed(() => ({
      ok: { title: 'OK', variant: 'success' },
      no_drawing: { title: "Image doesn't have a drawing", variant: 'warning' },
      ...(/-ml$/.test(selectedDataset.value!)
        ? {}
        : {
            shows_author: {
              title: 'Image contains author',
              variant: 'warning',
            },
          }),
    }))

    onMounted(async () => {
      const data = await $axios.$get(`/api/admin/maintenance`)
      datasets.value = [
        { value: null, text: 'Select a dataset' },
        ...data.datasets.map(({ name }: { name: string }) => ({
          value: name,
          text: name,
        })),
      ]
    })

    const loadImagesToMaintain = async (datasetName: string | null) => {
      if (!datasetName) {
        validatedAndRemainingImageCount.value = null
        return
      }
      const { entryurlsToMaintain, maintainedEntryurlsCount } =
        await $axios.$get(`/api/admin/maintenance?dataset=${datasetName}`)
      entryurlsPendingMaintenanceWithUrls.value = entryurlsToMaintain.map(
        (data: any) => ({
          ...data,
          decision: data.entryurl_details.decision || 'ok',
          url: `${process.env.CLOUDINARY_URL_ROOT}${data.sitecode_url}`,
        })
      )

      validatedAndRemainingImageCount.value = maintainedEntryurlsCount.reduce(
        (
          acc: { validated: number },
          { decision, count }: { decision: string | null; count: number }
        ) => ({
          ...acc,
          [decision === null ? 'not_validated' : 'validated']:
            decision === null ? count : (acc.validated || 0) + count,
        }),
        {}
      )
    }

    watch(
      () => selectedDataset.value,
      async (newValue) => {
        await loadImagesToMaintain(newValue)
      }
    )

    return {
      datasets,
      decisions,
      selectedDataset,
      entryurlsPendingMaintenanceWithUrls,
      validatedAndRemainingImageCount,
      async submitInvalidations() {
        await $axios.$post(`/api/admin/maintenance`, {
          entryurlsPendingMaintenance:
            entryurlsPendingMaintenanceWithUrls.value,
        })
        await loadImagesToMaintain(selectedDataset.value)
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
  padding: 10px 5px;

  &.invalid {
    border: 1px solid red;
  }

  img {
    height: initial;
  }
}
</style>
