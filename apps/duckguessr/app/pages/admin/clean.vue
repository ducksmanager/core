<template>
  <div v-if="!user" />
  <div v-else-if="!isAllowed" class="clean-page">
    <b-container fluid class="py-4">
      <b-row class="justify-content-center">
        <b-col lg="8" xl="6">
          <b-alert variant="danger" :model-value="true" class="shadow-lg">
            <BiShieldExclamation class="me-2" />
            {{ t("Only an administrator can clean images!") }}
          </b-alert>
        </b-col>
      </b-row>
    </b-container>
  </div>
  <div v-else class="clean-page">
    <b-container fluid class="py-4">
      <b-row class="justify-content-center">
        <b-col lg="10" xl="8">
          <div class="text-center mb-5">
            <h1
              class="display-4 fw-bold text-white mb-3 d-flex align-items-center justify-content-center"
            >
              <BiBrush class="me-3" />
              Image Cleanup
            </h1>
            <p class="lead text-light opacity-75">
              Review and validate images for Duckguessr datasets
            </p>
          </div>

          <b-card class="shadow-lg border-0 mb-4" body-class="p-4">
            <h3 class="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
              <BiInfoCircle class="me-2" />
              Guidelines
            </h3>
            <p class="text-muted mb-3">
              {{
                t("Select the images that shouldn't be shown on Duckguessr:")
              }}
            </p>
            <ul class="list-unstyled">
              <li class="mb-3">
                <strong>{{ t("Images with no drawing inside") }}</strong
                >. Examples:
                <b-table-simple hover small bordered responsive class="mt-2">
                  <b-tr>
                    <b-td>
                      <img
                        src="https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/thumbnails3/webusers/2017/08/gr_mm_0721d_001.jpg"
                        class="img-thumbnail"
                        style="height: 100px"
                      />
                    </b-td>
                    <b-td>
                      <div>{{ t("The image contains only a text") }}</div>
                    </b-td>
                  </b-tr>
                  <b-tr>
                    <b-td>
                      <img
                        src="https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/thumbnails3/webusers/2019/09/it_cts_017dd_001.jpg"
                        class="img-thumbnail"
                        style="height: 100px"
                      />
                    </b-td>
                    <b-td>
                      <div>
                        {{ t("The image doesn't contain a proper drawing") }}
                      </div>
                    </b-td>
                  </b-tr>
                  <b-tr>
                    <b-td>
                      <img
                        src="https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/thumbnails3/webusers/2014/02/es_pd1_11i_001.jpg"
                        class="img-thumbnail"
                        style="height: 100px"
                      />
                    </b-td>
                    <b-td>
                      <div>
                        {{
                          t(
                            "The image contains only a generic Disney drawing that's not specific to a story",
                          )
                        }}
                      </div>
                    </b-td>
                  </b-tr>
                </b-table-simple>
              </li>
              <li>
                <strong>{{
                  t("Images on which the cartoonist's name is written")
                }}</strong>
              </li>
            </ul>
          </b-card>

          <b-card class="shadow-lg border-0 mb-4" body-class="p-4">
            <h3 class="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
              <BiDatabase class="me-2" />
              Dataset Selection
            </h3>
            <b-form-group>
              <template #label>Select Dataset</template>
              <b-form-select
                v-model="selectedDataset"
                :options="datasets"
                size="lg"
                class="border-2"
              />
            </b-form-group>
            <b-alert
              v-if="validatedAndRemainingImageCount"
              variant="info"
              :model-value="true"
              class="mt-3"
            >
              <BiBarChart class="me-2" />
              {{
                t(
                  "{validated} images from this dataset can currently be seen on Duckguessr, {notValidated} are left to maintain.",
                  {
                    validated: validatedAndRemainingImageCount.validated || 0,
                    notValidated:
                      validatedAndRemainingImageCount.not_validated || 0,
                  },
                )
              }}
            </b-alert>
          </b-card>

          <b-card
            v-if="selectedDataset"
            class="shadow-lg border-0 mb-4"
            body-class="p-4"
          >
            <h3 class="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
              <BiFunnel class="me-2" />
              Filter Options
            </h3>
            <b-button-group class="w-100">
              <b-button
                v-for="(decision, id) in decisionsWithNonValidated"
                :key="id"
                :variant="decision.variant"
                :pressed="decision.pressed"
                size="lg"
                @click="decision.pressed = !decision.pressed"
              >
                <BiCheck v-if="decision.pressed" class="me-2" />
                <BiX v-else class="me-2" />
                {{ decision.title }}
              </b-button>
            </b-button-group>
          </b-card>

          <b-card
            v-if="selectedDataset"
            class="shadow-lg border-0 mb-4"
            body-class="p-4"
          >
            <h3 class="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
              <BiImages class="me-2" />
              Image Review
            </h3>

            <div
              v-if="isLoading"
              class="text-center py-4 d-flex align-items-center justify-content-center"
            >
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Loading images...</span>
            </div>

            <div v-else-if="entryurlsPendingMaintenanceWithUrls.length">
              <b-pagination
                v-if="totalRows"
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="rowsPerPage"
                class="mb-4"
              />

              <div class="row g-3">
                <div
                  v-for="(
                    { sitecodeUrl, url, decision }, index
                  ) in entryurlsPendingMaintenanceWithUrls"
                  :key="sitecodeUrl"
                  class="col-6 col-md-4 col-lg-3"
                >
                  <div class="image-review-card d-flex flex-column">
                    <b-img
                      :src="url"
                      alt="Review image"
                      fluid
                      class="rounded shadow-sm mb-2"
                      style="aspect-ratio: 1; object-fit: cover"
                    />
                    <b-button-group vertical size="sm" class="w-100">
                      <b-button
                        v-for="({ variant, title }, id) in decisions"
                        :key="`${sitecodeUrl}-${id}`"
                        :disabled="isLoading"
                        :variant="variant"
                        :pressed="decision === id"
                        @click="entryurlsPendingMaintenanceWithUrls[index]!.decision = id"
                      >
                        {{ title }}
                      </b-button>
                    </b-button-group>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4 text-muted">
              <BiImages class="fs-1 mb-3 opacity-50" />
              <p class="mb-0">No images to review</p>
            </div>
          </b-card>

          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <b-button
              v-if="entryurlsPendingMaintenanceWithUrls.length"
              variant="success"
              size="lg"
              :disabled="isLoading"
              class="px-4"
              @click="submitInvalidations()"
            >
              <BiCheckCircle class="me-2" />
              Submit Changes
            </b-button>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts" setup>
import { playerStore } from "~/stores/player";
import { getUrl } from "~/composables/url";
import type { entryurlDetailsDecision } from "~duckguessr-prisma-browser";
import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";
import type { BaseButtonVariant } from "bootstrap-vue-next";
const { maintenanceSocket } = inject(duckguessrSocketInjectionKey)!;

interface DatasetWithDecisionCounts {
  id: number;
  name: string;
  decisions: {
    ok: number | null;
    shows_author: number | null;
    no_drawing: number | null;
    null: number | null;
  };
}

interface Decision {
  variant: keyof BaseButtonVariant;
  title: string;
  pressed: boolean;
}

const { t } = useI18n();
const datasetsGroupedByDecision = ref(
  {} as { [key: string]: DatasetWithDecisionCounts },
);
const datasets = ref([] as { text: string; value: string | null }[]);
const entryurlsPendingMaintenanceWithUrls = ref(
  [] as {
    sitecodeUrl: string;
    decision: entryurlDetailsDecision;
    url: string;
  }[],
);
const validatedAndRemainingImageCount = ref<{
  not_validated: number;
  validated: number;
}>();
const selectedDataset = ref<string>();
const isLoading = ref(false);
const currentPage = ref(1);
const totalRows = ref(10000);
const rowsPerPage = 60;

const user = computed(() => playerStore().playerUser);
const isAllowed = computed(
  () =>
    user.value &&
    [
      "brunoperel",
      "Wizyx",
      "remifanpicsou",
      "Alex Puaud",
      "GlxbltHugo",
      "Picsou22",
    ].includes(user.value.username),
);
const decisions = {
  ok: {
    pressed: false,
    title: "OK",
    variant: "outline-success" as keyof BaseButtonVariant,
  },
  no_drawing: {
    pressed: false,
    title: t("Image doesn't have a drawing").toString(),
    variant: "outline-warning" as keyof BaseButtonVariant,
  },
  shows_author: {
    pressed: false,
    title: t("Image contains author").toString(),
    variant: "outline-warning" as keyof BaseButtonVariant,
  },
};
const decisionsWithNonValidated = ref({
  null: {
    pressed: true,
    title: t("Non-validated images").toString(),
    variant: "secondary" as keyof BaseButtonVariant,
  },
  ...decisions,
});
const loadDatasets = async () => {
  datasetsGroupedByDecision.value = (
    await maintenanceSocket.getMaintenanceData()
  ).reduce<{ [key: string]: DatasetWithDecisionCounts }>(
    (
      acc,
      {
        name,
        decision,
        count,
      }: { name: string; decision: string; count: number },
    ) => ({
      ...acc,
      [name]: {
        ...(acc[name] || { name }),
        decisions: {
          ...((acc[name] || { decisions: {} }).decisions || {}),
          [decision + ""]: count,
        },
      },
    }),
    {},
  );

  datasets.value = [
    { value: null, text: "Select a dataset" },
    ...Object.values(datasetsGroupedByDecision.value).map(
      ({ name, decisions }: DatasetWithDecisionCounts) => ({
        value: name,
        text:
          name +
          " (accepted: " +
          (decisions.ok || 0) +
          ", rejected: " +
          ((decisions.shows_author || 0) + (decisions.no_drawing || 0)) +
          ", left to validate: " +
          (decisions.null || 0) +
          ")",
      }),
    ),
  ];
};
const loadImagesToMaintain = async (
  datasetName: string | null,
  decisionsWithNonValidated: Record<entryurlDetailsDecision | "null", Decision>,
  offset: number,
) => {
  if (!datasetName) {
    validatedAndRemainingImageCount.value = undefined;
    return;
  }
  isLoading.value = true;
  const entryurlsToMaintain =
    await maintenanceSocket.getMaintenanceDataForDataset(
      datasetName,
      (
        Object.keys(decisionsWithNonValidated) as (
          | entryurlDetailsDecision
          | "null"
        )[]
      ).filter((key) => decisionsWithNonValidated[key].pressed),
      offset,
    );
  await loadDatasets();
  isLoading.value = false;
  entryurlsPendingMaintenanceWithUrls.value = entryurlsToMaintain.map(
    (data) => ({
      ...data,
      decision: data.entryurlDetails.decision || "ok",
      url: getUrl(data.sitecodeUrl),
    }),
  );

  const datasetsAndDecisions =
    datasetsGroupedByDecision.value[datasetName].decisions;
  validatedAndRemainingImageCount.value = {
    not_validated: datasetsAndDecisions.null || 0,
    validated:
      (datasetsAndDecisions.ok || 0) +
      (datasetsAndDecisions.shows_author || 0) +
      (datasetsAndDecisions.no_drawing || 0),
  };
};

watch(
  decisionsWithNonValidated,
  async (newValue) => {
    await loadImagesToMaintain(
      selectedDataset.value ?? null,
      newValue,
      (currentPage.value - 1) * rowsPerPage,
    );
  },
  { deep: true },
);

watch(selectedDataset, async (newValue) => {
  await loadImagesToMaintain(
    newValue ?? null,
    decisionsWithNonValidated.value,
    (currentPage.value - 1) * rowsPerPage,
  );
});

watch(currentPage, async (newValue) => {
  await loadImagesToMaintain(
    selectedDataset.value ?? null,
    decisionsWithNonValidated.value,
    (newValue - 1) * rowsPerPage,
  );
});

watch(
  isAllowed,
  async () => {
    await loadDatasets();
  },
  { immediate: true },
);

const submitInvalidations = async () => {
  isLoading.value = true;
  await maintenanceSocket.updateMaintenanceData(
    entryurlsPendingMaintenanceWithUrls.value,
  );

  await loadImagesToMaintain(
    selectedDataset.value ?? null,
    decisionsWithNonValidated.value,
    currentPage.value - 1,
  );
  isLoading.value = false;
};
</script>

<style scoped lang="scss">
@use "../../../styles/theme.scss";

.clean-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.image-review-card {
  transition: transform 0.2s ease;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.1);
  }

  img {
    object-fit: contain !important;
  }
}

:deep(table) {
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
</style>
