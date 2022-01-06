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
        Cliquez sur les images qui ne doivent pas être utilisées dans
        Duckguessr:
        <ul>
          <li>Images qui ne contiennent pas de dessin</li>
          <li>Images sur lesquelles le nom du dessinateur est inscrit</li>
        </ul>
      </b-col>
    </b-row>
    <b-row v-if="!entryurlsPendingMaintenanceWithUrls.length">
      Toutes les images de ce jeu de données ont été validées.
    </b-row>
    <template v-else>
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
import { onMounted, ref, useContext, watch } from '@nuxtjs/composition-api'
import type Index from '@prisma/client'

export default {
  name: 'Clean',
  setup() {
    const { $axios } = useContext()

    const decisions = {
      ok: { title: 'OK', variant: 'success' },
      shows_author: { title: 'Image contains author', variant: 'warning' },
      no_drawing: { title: "Image doesn't have a drawing", variant: 'warning' },
    }

    let datasets: Index.datasets[] | null = null
    const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
    const maintainedEntryurlsCount: Array<any> | null = null
    let validatedAndRemainingImageCount: any = null
    const selectedDataset = ref(null as String | null)

    onMounted(async () => {
      const data = await $axios.$get(`/api/admin/maintenance?dataset=us`)
      datasets = [
        { value: null, text: 'Please select an option' },
        ...data.datasets.map(({ name }: { name: string }) => ({
          value: name,
          text: name,
        })),
      ]
    })

    watch(
      () => selectedDataset.value,
      async (newValue) => {
        if (!newValue) {
          validatedAndRemainingImageCount = null
          return
        }
        const { entryurlsToMaintain, maintainedEntryurlsCount } =
          await $axios.$get(`/api/admin/maintenance?dataset=${newValue}`)
        entryurlsPendingMaintenanceWithUrls.value = entryurlsToMaintain.map(
          (data: any) => ({
            ...data,
            decision: data.decision || 'ok',
            url: `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${data.sitecodeUrl}`,
          })
        )

        validatedAndRemainingImageCount = maintainedEntryurlsCount.reduce(
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
    )

    return {
      datasets,
      decisions,
      selectedDataset,
      entryurlsPendingMaintenanceWithUrls,
      maintainedEntryurlsCount,
      validatedAndRemainingImageCount,
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
