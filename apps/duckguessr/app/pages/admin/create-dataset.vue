<template>
  <div class="create-dataset-page">
    <b-container fluid class="py-4">
      <b-row class="justify-content-center">
        <b-col lg="8" xl="6">
          <!-- Header Section -->
          <div class="text-center mb-5">
            <h1
              class="display-4 fw-bold text-white mb-3 d-flex align-items-center justify-content-center"
            >
              <BiDatabaseAdd class="me-3" />
              Create Dataset
            </h1>
            <p class="lead text-light opacity-75">
              Configure filters and create a new Duckguessr dataset
            </p>
          </div>

          <!-- Main Form Card -->
          <b-card class="shadow-lg border-0" body-class="p-4">
            <b-form @submit.prevent="createDataset">
              <!-- Basic Information Section -->
              <div class="mb-4">
                <h3
                  class="h5 fw-semibold text-dark mb-3 d-flex align-items-center"
                >
                  <BiInfoCircle class="me-2" />
                  Basic Information
                </h3>

                <b-form-group class="mb-3">
                  <template #label>Dataset Name</template>
                  <b-form-input
                    id="name"
                    v-model="name"
                    placeholder="Enter dataset name"
                    size="lg"
                    class="border-2"
                  />
                </b-form-group>

                <b-form-group class="mb-3">
                  <template #label>Description</template>
                  <b-form-input
                    id="description"
                    v-model="description"
                    placeholder="Enter description"
                    size="lg"
                    class="border-2"
                  />
                </b-form-group>
              </div>

              <div class="mb-4">
                <h3
                  class="h5 fw-semibold text-dark mb-3 d-flex align-items-center"
                >
                  <BiFunnel class="me-2" />
                  Author filters
                </h3>

                <!-- Nationality Filter -->
                <b-card class="mb-3 border-light" body-class="p-3">
                  <b-form-group>
                    <b-form-checkbox
                      class="fw-medium mb-2"
                      :model-value="
                        filters.personNationalityFilter !== undefined
                      "
                      @update:model-value="
                        filters.personNationalityFilter = $event
                          ? []
                          : undefined
                      "
                    >
                      <BiGlobe class="me-2" />
                      Filter by author nationality
                    </b-form-checkbox>
                    <b-form-select
                      v-model="filters.personNationalityFilter"
                      :disabled="!filters.personNationalityFilter"
                      :options="personNationalityOptions"
                      multiple
                      size="lg"
                      class="border-2"
                      placeholder="Select countries..."
                    />
                  </b-form-group>
                </b-card>
              </div>
              <div class="mb-4">
                <h3
                  class="h5 fw-semibold text-dark mb-3 d-flex align-items-center"
                >
                  <BiFunnel class="me-2" />
                  Date filters
                </h3>

                <!-- Date Range Filter -->
                <b-card class="mb-3 border-light" body-class="p-3">
                  <b-form-group>
                    <b-form-checkbox
                      class="fw-medium mb-3"
                      :model-value="filters.oldestDateFilterMin !== undefined"
                      @update:model-value="
                        filters.oldestDateFilterMin = $event ? 1900 : undefined;
                        filters.oldestDateFilterMax = $event ? 2025 : undefined;
                      "
                    >
                      <BiCalendarRange class="me-2" />
                      Filter by publication date range
                    </b-form-checkbox>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <label
                          for="oldest-date-filter"
                          class="d-flex align-items-center form-label"
                        >
                          From {{ filters.oldestDateFilterMin }}
                        </label>
                        <b-form-input
                          id="oldest-date-filter"
                          v-model="filters.oldestDateFilterMin"
                          :disabled="!filters.oldestDateFilterMin"
                          type="range"
                          size="lg"
                          class="border-2"
                          :min="1900"
                          :max="2025"
                        />
                      </div>
                      <div class="col-md-6">
                        <label
                          for="newest-date-filter"
                          class="d-flex align-items-center form-label"
                        >
                          To {{ filters.oldestDateFilterMax }}
                        </label>
                        <b-form-input
                          id="newest-date-filter"
                          v-model="filters.oldestDateFilterMax"
                          :disabled="!filters.oldestDateFilterMax"
                          type="range"
                          :min="1900"
                          :max="2025"
                          size="lg"
                          class="border-2"
                        />
                      </div>
                    </div>
                  </b-form-group>
                </b-card>
              </div>

              <div class="mb-4">
                <h3
                  class="h5 fw-semibold text-dark mb-3 d-flex align-items-center"
                >
                  <BiFunnel class="me-2" />
                  Amount filters
                </h3>

                <b-alert
                  v-if="
                    !datasetPreview ||
                    !('datasetSize' in datasetPreview) ||
                    !datasetPreview.datasetSize
                  "
                  variant="warning"
                  :model-value="true"
                >
                  You need to have at least one match to see this section
                </b-alert>
                <b-card
                  v-else-if="datasetPreview && 'authors' in datasetPreview"
                  class="mb-3 border-light"
                  body-class="p-3"
                >
                  <b-table
                    :tbody-tr-class="datasetPreviewRowClass"
                    :items="
                      Object.entries(datasetPreview.authors).map(
                        ([key, value]) => ({ key, value }),
                      )
                    "
                    :fields="['key', 'value']"
                  />
                  <b-form-group>
                    <b-form-radio
                      v-model="filters.authorMatchesCount.type"
                      name="author-matches-count-filter"
                      value="minMatchesPerAuthor"
                      >Restrict to authors with at least this amount of matches
                      <template
                        v-if="
                          filters.authorMatchesCount.type ===
                          'minMatchesPerAuthor'
                        "
                      >
                        {{ filters.authorMatchesCount.value }}
                      </template>
                      <b-form-input
                        id="min-matches-filter"
                        :model-value="
                          filters.authorMatchesCount.type ===
                          'minMatchesPerAuthor'
                            ? minMatchesPerAuthorOptions.indexOf(
                                filters.authorMatchesCount.value ?? 0,
                              )
                            : 0
                        "
                        :disabled="
                          filters.authorMatchesCount.type !==
                          'minMatchesPerAuthor'
                        "
                        type="range"
                        size="lg"
                        :min="0"
                        :max="minMatchesPerAuthorOptions.length - 1"
                        @update:model-value="
                          filters.authorMatchesCount.value =
                                minMatchesPerAuthorOptions[parseInt($event as string)]
                        "
                      />
                    </b-form-radio>
                    <b-form-radio
                      v-model="filters.authorMatchesCount.type"
                      name="author-matches-count-filter"
                      value="minAuthorCount"
                      >Restrict to at least this amount of authors with the most
                      matches
                      <template
                        v-if="
                          filters.authorMatchesCount.type === 'minAuthorCount'
                        "
                      >
                        {{ filters.authorMatchesCount.value }}
                      </template>
                      <b-form-input
                        id="min-author-count-filter"
                        :model-value="
                          filters.authorMatchesCount.type === 'minAuthorCount'
                            ? (filters.authorMatchesCount.value ?? 0)
                            : 0
                        "
                        :disabled="
                          filters.authorMatchesCount.type !== 'minAuthorCount'
                        "
                        type="range"
                        size="lg"
                        :min="0"
                        :max="Object.keys(datasetPreview?.authors ?? {}).length"
                        @update:model-value="
                          filters.authorMatchesCount.value = parseInt($event as string)
                        "
                      />
                    </b-form-radio>
                  </b-form-group>
                </b-card>
              </div>

              <div class="mb-4">
                <h3
                  class="h5 fw-semibold text-dark mb-3 d-flex align-items-center"
                >
                  <BiEye class="me-2" />
                  Preview Matches
                </h3>

                <div
                  v-if="datasetPreview && 'errors' in datasetPreview"
                  class="mb-4"
                >
                  <b-alert
                    v-for="error in datasetPreview.errors"
                    :key="error"
                    variant="warning"
                    :model-value="true"
                    >{{ error }}</b-alert
                  >
                </div>
                <b-card class="border-light" body-class="p-3">
                  <div
                    v-if="isCalculatingDatasetPreview"
                    class="text-center py-4 d-flex align-items-center justify-content-center"
                  >
                    <b-spinner variant="primary" class="me-2" />
                    <span class="text-muted">Calculating matches...</span>
                  </div>

                  <div
                    v-else-if="
                      datasetPreview &&
                      'samples' in datasetPreview &&
                      datasetPreview.samples.length
                    "
                    class="matches-preview"
                  >
                    <div class="row g-3 pb-3">
                      <div
                        v-for="(sample, index) in datasetPreview.samples"
                        :key="index"
                        class="col-6 col-md-4 col-lg-3"
                      >
                        <div class="match-thumbnail d-flex flex-column">
                          <b-img
                            :src="CLOUDINARY_URL_ROOT + sample.url"
                            alt="Match preview"
                            fluid
                            class="rounded shadow-sm"
                            style="aspect-ratio: 1; object-fit: cover"
                          />
                          <b-badge variant="success" class="fs-6">
                            {{ sample.personcode }}
                          </b-badge>
                        </div>
                      </div>
                    </div>
                    <div
                      class="mt-3 text-center position-absolute bottom-0 w-100"
                    >
                      <b-badge variant="success" class="fs-6">
                        {{ datasetPreview.datasetSize }} matches found
                      </b-badge>
                    </div>
                  </div>

                  <div v-else class="text-center py-4 text-muted">
                    <p class="mb-0">No matches found with current filters</p>
                  </div>
                </b-card>
              </div>

              <!-- Action Buttons -->
              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <b-button
                  variant="outline-secondary"
                  size="lg"
                  class="me-md-2"
                  @click="resetForm"
                >
                  <BiArrowClockwise class="me-2" />
                  Reset
                </b-button>
                <b-button
                  type="submit"
                  variant="primary"
                  size="lg"
                  :disabled="!name || !description"
                  class="px-4"
                >
                  <BiPlusCircle class="me-2" />
                  Create Dataset
                </b-button>
              </div>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script setup lang="ts">
import type { EventOutput } from "socket-call-client";
import type { ClientEmitEvents as DatasetsEmitEvents } from "~duckguessr-services/datasets";

import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";
const { datasetsSocket } = inject(duckguessrSocketInjectionKey)!;

const CLOUDINARY_URL_ROOT = import.meta.env.VITE_CLOUDINARY_URL_ROOT;

const countryNames = ref({
  fr: "France",
  us: "United States",
  it: "Italy",
});

const datasetPreview = ref<EventOutput<DatasetsEmitEvents, "previewDataset">>();

const isCalculatingDatasetPreview = ref(false);

const name = ref("");
const description = ref("");
const filters = ref<{
  personNationalityFilter: string[] | undefined;
  oldestDateFilterMin: number | undefined;
  oldestDateFilterMax: number | undefined;
  authorMatchesCount: {
    type: "minMatchesPerAuthor" | "minAuthorCount" | "none";
    value?: number;
  };
}>({
  personNationalityFilter: undefined,
  oldestDateFilterMin: undefined,
  oldestDateFilterMax: undefined,
  authorMatchesCount: { type: "none" },
});

const personNationalityOptions = computed(() =>
  Object.entries(countryNames.value).map(([countrycode, countryname]) => ({
    value: countrycode,
    text: countryname,
  })),
);

const authors = computed(() =>
  datasetPreview.value && "authors" in datasetPreview.value
    ? datasetPreview.value.authors
    : {},
);

const minMatchesPerAuthorOptions = computed(() =>
  new Set(Object.values(authors.value).reverse()).values().toArray(),
);

const isAuthorFiltered = (item: { key: string; value: number }) =>
  (filters.value.authorMatchesCount.type === "minMatchesPerAuthor" &&
    item.value < (filters.value.authorMatchesCount.value ?? 0)) ||
  (filters.value.authorMatchesCount.type === "minAuthorCount" &&
    Object.keys(authors.value).reverse().indexOf(item.key) <
      (filters.value.authorMatchesCount.value ?? 0));

const datasetPreviewRowClass = (
  item: { key: string; value: number } | null | undefined,
) => (item && isAuthorFiltered(item) ? "text-decoration-line-through" : "");

// Form functions
const resetForm = () => {
  name.value = "";
  description.value = "";
  filters.value = {
    personNationalityFilter: undefined,
    oldestDateFilterMin: undefined,
    oldestDateFilterMax: undefined,
    authorMatchesCount: { type: "none" },
  };
  datasetPreview.value = undefined;
};

const createDataset = async () => {
  if (!name.value || !description.value) {
    return;
  }

  try {
    console.log("Creating dataset:", {
      name: name.value,
      description: description.value,
      filters: filters.value,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Dataset created successfully!");
  } catch (error) {
    console.error("Error creating dataset:", error);
  }
};

// Watch for filter changes to update matches
watch(
  () => [
    filters.value.personNationalityFilter,
    filters.value.oldestDateFilterMin,
    filters.value.oldestDateFilterMax,
  ],
  async () => {
    console.log("Filters changed, updating matches...");
    isCalculatingDatasetPreview.value = true;
    datasetPreview.value = undefined;
    datasetsSocket
      .previewDataset({
        personNationalityFilter: filters.value.personNationalityFilter,
        oldestDateFilterMin: filters.value.oldestDateFilterMin,
        oldestDateFilterMax: filters.value.oldestDateFilterMax,
        // minMatchesPerAuthor: filters.value.minMatchesPerAuthor,
      })
      .then((result) => {
        datasetPreview.value = result;
      })
      .finally(() => {
        isCalculatingDatasetPreview.value = false;
      });
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.create-dataset-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.matches-preview {
  max-height: 400px;
  overflow-y: auto;
}

.match-thumbnail {
  transition: transform 0.2s ease;

  img {
    object-fit: contain !important;
  }
}

.match-thumbnail:hover {
  transform: scale(1.05);
}

.border-2 {
  border-width: 2px !important;
}

.card {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

.form-label {
  color: #495057;
}

.text-white {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.btn {
  border-radius: 0.5rem;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #5a6fd8, #6a4190);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  transform: translateY(-1px);
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.badge {
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .create-dataset-page .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .display-4 {
    font-size: 2rem;
  }

  .lead {
    font-size: 1rem;
  }
}
</style>