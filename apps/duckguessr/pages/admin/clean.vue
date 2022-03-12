<template>
  <b-container v-if="!user" fluid class="p-4 bg-dark"> Loading... </b-container>
  <b-container v-else-if="!isAllowed" fluid class="p-4 bg-dark">
    {{ t('Only an administrator can clean images!') }}
  </b-container>
  <b-container v-else fluid class="p-4 bg-dark">
    <b-row class="my-3">
      <b-col cols="12">
        <b-select v-model="selectedDataset" :options="datasets" />
        <div v-if="validatedAndRemainingImageCount">
          {{
            t(
              '{validated} images from this dataset can currently be seen on Duckguessr, {notValidated} are left to maintain.',
              {
                validated: validatedAndRemainingImageCount.validated || 0,
                notValidated: validatedAndRemainingImageCount.not_validated || 0,
              }
            )
          }}
        </div>
      </b-col>
    </b-row>
    <template v-if="!selectedDataset" />
    <b-alert v-else-if="!entryurlsPendingMaintenanceWithUrls.length" show variant="success">
      {{ t('All the images in this dataset have been validated.') }}
    </b-alert>
    <template v-else>
      <b-row>
        <b-col cols="12">
          {{ t("Select the images that shouldn't be shown on Duckguessr:") }}
          <ul>
            <li>
              {{ t('Images with no drawing inside') }}. Examples:
              <b-table-simple hover small bordered responsive>
                <b-tr>
                  <b-td>
                    <img
                      src="https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/thumbnails3/webusers/2017/08/gr_mm_0721d_001.jpg"
                    />
                  </b-td>
                  <b-td>
                    <div>{{ t('The image contains only a text') }}</div>
                  </b-td>
                </b-tr>
                <b-tr>
                  <b-td>
                    <img
                      src="https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/thumbnails3/webusers/2019/09/it_cts_017dd_001.jpg"
                    />
                  </b-td>
                  <b-td>
                    <div>{{ t("The image doesn't contain a proper drawing") }}</div>
                  </b-td>
                </b-tr>
                <b-tr>
                  <b-td>
                    <img
                      src="https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/thumbnails3/webusers/2014/02/es_pd1_11i_001.jpg"
                    />
                  </b-td>
                  <b-td>
                    <div>
                      {{
                        t(
                          "The image contains only a generic Disney drawing that's not specific to a story"
                        )
                      }}
                    </div>
                  </b-td>
                </b-tr>
              </b-table-simple>
            </li>
            <li>
              {{ t("Images on which the cartoonist's name is written") }}
            </li>
          </ul>
        </b-col>
        <b-col
          v-for="({ sitecode_url, url, decision }, index) in entryurlsPendingMaintenanceWithUrls"
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
              @click="entryurlsPendingMaintenanceWithUrls[index].decision = value"
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
import { computed, onMounted, ref, useContext, watch } from '@nuxtjs/composition-api'
import type Index from '@prisma/client'
import { io } from 'socket.io-client'
import { useI18n } from 'nuxt-i18n-composable'
import { setUserCookieIfNotExists } from '~/composables/user'

export default {
  name: 'Clean',
  setup() {
    const { $axios } = useContext()
    const { t } = useI18n()

    const datasets = ref([] as Array<Index.dataset>)
    const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
    const validatedAndRemainingImageCount = ref(null as any)
    const selectedDataset = ref(null as string | null)

    const user = ref(null as Index.player | null)

    const isAllowed = computed(
      () =>
        user.value &&
        ['brunoperel', 'Wizyx', 'remifanpicsou', 'Alex Puaud', 'GlxbltHugo', 'Picsou22'].includes(
          user.value.username
        )
    )

    const decisions = computed(() => ({
      ok: { title: 'OK', variant: 'success' },
      no_drawing: { title: t("Image doesn't have a drawing"), variant: 'warning' },
      ...(/-ml$/.test(selectedDataset.value!)
        ? {}
        : {
            shows_author: {
              title: t('Image contains author'),
              variant: 'warning',
            },
          }),
    }))

    onMounted(() => {
      setUserCookieIfNotExists()
      io(`${process.env.SOCKET_URL}/login`, {
        auth: {
          cookie: document.cookie,
        },
      }).on('logged', async (loggedInUser) => {
        console.log(loggedInUser)
        user.value = loggedInUser
        if (isAllowed.value) {
          const data = await $axios.$get(`/api/admin/maintenance`)

          datasets.value = [
            { value: null, text: 'Select a dataset' },
            ...data.datasets.map(({ name }: { name: string }) => ({
              value: name,
              text: name,
            })),
          ]
        }
      })
    })

    const loadImagesToMaintain = async (datasetName: string | null) => {
      if (!datasetName) {
        validatedAndRemainingImageCount.value = null
        return
      }
      const { entryurlsToMaintain, maintainedEntryurlsCount } = await $axios.$get(
        `/api/admin/maintenance?dataset=${datasetName}`
      )
      entryurlsPendingMaintenanceWithUrls.value = entryurlsToMaintain.map((data: any) => ({
        ...data,
        decision: data.entryurl_details.decision || 'ok',
        url: `${process.env.CLOUDINARY_URL_ROOT}${data.sitecode_url}`,
      }))

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
      t,
      datasets,
      decisions,
      user,
      isAllowed,
      selectedDataset,
      entryurlsPendingMaintenanceWithUrls,
      validatedAndRemainingImageCount,
      async submitInvalidations() {
        await $axios.$post(`/api/admin/maintenance`, {
          entryurlsPendingMaintenance: entryurlsPendingMaintenanceWithUrls.value,
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
::v-deep table {
  color: white !important;

  tr {
    td {
      vertical-align: middle;

      &:nth-child(1) {
        text-align: center;
      }

      img {
        height: 100px;
      }
    }
  }
}
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
