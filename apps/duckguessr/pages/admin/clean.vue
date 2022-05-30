<template>
  <b-container v-if="!user" fluid class="p-4 bg-dark"> Loading... </b-container>
  <b-container v-else-if="!isAllowed" fluid class="p-4 bg-dark">
    {{ t('Only an administrator can clean images!') }}
  </b-container>
  <b-container v-else fluid class="p-4 bg-dark">
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
    </b-row>
    <b-row class="my-3">
      <b-col cols="12">
        <b-form-select v-model="selectedDataset" :options="datasets" :plain="false" />
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

    <b-row v-show="selectedDataset">
      <b-col cols="12">
        <b-button-group>
          <b-button
            v-for="(decision, id) in decisionsWithNonValidated"
            :key="id"
            :variant="decision.variant"
            :pressed="decision.pressed"
            @click="decision.pressed = !decision.pressed"
          >
            <b-icon-check v-if="decision.pressed" /><b-icon-x v-else />&nbsp;{{ decision.title }}
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <template v-if="!selectedDataset" />
    <div v-else-if="isLoading">Loading...</div>
    <template v-else>
      <b-row>
        <b-pagination
          v-if="totalRows"
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="rowsPerPage"
        />
      </b-row>
      <b-row>
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
              v-for="({ variant, title }, id) in decisions"
              :key="`${sitecode_url}-${id}`"
              :disabled="isLoading"
              :variant="variant"
              :pressed="decision === id"
              @click="entryurlsPendingMaintenanceWithUrls[index].decision = id"
            >
              {{ title }}
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </template>
    <b-btn
      v-show="entryurlsPendingMaintenanceWithUrls.length"
      variant="success"
      :disabled="isLoading"
      @click="submitInvalidations()"
    >
      OK
    </b-btn>
  </b-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from '@nuxtjs/composition-api'
import type Index from '@prisma/client'
import { io } from 'socket.io-client'
import { useI18n } from 'nuxt-i18n-composable'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useAxios } from '@vueuse/integrations/useAxios'
import { BIconCheck, BIconX } from 'bootstrap-vue'
import { setUserCookieIfNotExists } from '~/composables/user'

interface DatasetWithDecisionCounts {
  id: number
  name: string
  decisions: {
    ok: number | null
    shows_author: number | null
    no_drawing: number | null
    null: number | null
  }
}

interface Decision {
  variant: string
  title: string
  pressed: boolean
}

const { t } = useI18n()
const datasetsGroupedByDecision = ref({} as { [key: string]: DatasetWithDecisionCounts })
const datasets = ref([] as Array<{ text: string; value: string | null }>)
const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
const validatedAndRemainingImageCount = ref(null as any)
const selectedDataset = ref(null as string | null)
const isLoading = ref(false as boolean)
const currentPage = ref(1 as number)
const totalRows = ref(10000 as number | null)
const rowsPerPage = 60
const user = ref(null as Index.player | null)
const isAllowed = computed(() => user.value)
const decisions: { [key: string]: Decision } = {
  ok: { pressed: false, title: 'OK', variant: 'success' },
  no_drawing: {
    pressed: false,
    title: t("Image doesn't have a drawing").toString(),
    variant: 'warning',
  },
  shows_author: {
    pressed: false,
    title: t('Image contains author').toString(),
    variant: 'warning',
  },
}
const decisionsWithNonValidated = ref({
  null: { pressed: true, title: t('Non-validated images').toString(), variant: 'secondary' },
  ...decisions,
} as { [key: string]: Decision })
const loadDatasets = async () => {
  datasetsGroupedByDecision.value = (
    await useAxios(`/api/admin/maintenance`)
  ).data.value.datasets.reduce(
    (acc: any, { name, decision, count }: { name: string; decision: string; count: number }) => ({
      ...acc,
      [name]: {
        ...(acc[name] || { name }),
        decisions: {
          ...((acc[name] || { decisions: {} }).decisions || {}),
          [decision + '']: count,
        },
      },
    }),
    {}
  )

  datasets.value = [
    { value: null, text: 'Select a dataset' },
    ...Object.values(datasetsGroupedByDecision.value).map(
      ({ name, decisions }: DatasetWithDecisionCounts) => ({
        value: name,
        text:
          name +
          ' (accepted: ' +
          (decisions.ok || 0) +
          ', rejected: ' +
          ((decisions.shows_author || 0) + (decisions.no_drawing || 0)) +
          ', left to validate: ' +
          (decisions.null || 0) +
          ')',
      })
    ),
  ]
}
const loadImagesToMaintain = async (
  datasetName: string | null,
  decisionsWithNonValidated: { [key: string]: Decision },
  offset: number
) => {
  if (!datasetName) {
    validatedAndRemainingImageCount.value = null
    return
  }
  isLoading.value = true
  const { entryurlsToMaintain } = (
    await useAxios(
      `/api/admin/maintenance?dataset=${datasetName}&offset=${offset}&decisions=${Object.keys(
        decisionsWithNonValidated
      ).filter((key) => decisionsWithNonValidated[key].pressed)}`
    )
  ).data.value
  await loadDatasets()
  isLoading.value = false
  entryurlsPendingMaintenanceWithUrls.value = entryurlsToMaintain.map((data: any) => ({
    ...data,
    decision: data.entryurl_details.decision || 'ok',
    url: `${process.env.CLOUDINARY_URL_ROOT}${data.sitecode_url}`,
  }))

  const datasetsAndDecisions = datasetsGroupedByDecision.value[datasetName].decisions
  validatedAndRemainingImageCount.value = {
    not_validated: datasetsAndDecisions.null || 0,
    validated:
      (datasetsAndDecisions.ok || 0) +
      (datasetsAndDecisions.shows_author || 0) +
      (datasetsAndDecisions.no_drawing || 0),
  }
}

watch(
  () => decisionsWithNonValidated.value,
  async (newValue) => {
    await loadImagesToMaintain(
      selectedDataset.value,
      newValue,
      (currentPage.value - 1) * rowsPerPage
    )
  },
  { deep: true }
)

watch(
  () => selectedDataset.value,
  async (newValue) => {
    await loadImagesToMaintain(
      newValue,
      decisionsWithNonValidated.value,
      (currentPage.value - 1) * rowsPerPage
    )
  }
)

watch(
  () => currentPage.value,
  async (newValue) => {
    await loadImagesToMaintain(
      selectedDataset.value,
      decisionsWithNonValidated.value,
      (newValue - 1) * rowsPerPage
    )
  }
)

onMounted(() => {
  io(`${process.env.SOCKET_URL}/login`, {
    auth: {
      cookie: useCookies().getAll(),
    },
  }).on('logged', async (loggedInUser) => {
    user.value = loggedInUser
    if (isAllowed.value) {
      await loadDatasets()
    }
  })
})

const submitInvalidations = async () => {
  isLoading.value = true
  await useAxios(`/api/admin/maintenance`, {
    method: 'POST',
    data: {
      entryurlsPendingMaintenance: entryurlsPendingMaintenanceWithUrls.value,
    },
  })
  await loadImagesToMaintain(
    selectedDataset.value,
    decisionsWithNonValidated.value,
    currentPage.value - 1
  )
  isLoading.value = false
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
