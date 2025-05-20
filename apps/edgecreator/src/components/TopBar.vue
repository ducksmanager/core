<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-start position-absolute w-auto options">
        <b-navbar toggleable class="ps-0 pt-0">
          <b-navbar-toggle target="nav-collapse" />

          <b-collapse id="nav-collapse" is-nav class="flex-column p-2">
            <b-row class="zoom-option">
              <b-col cols="3">
                <input
                  v-model="zoom"
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  style="width: 100%"
                />
              </b-col>
              <b-col>{{ $t("Zoom") }}: {{ zoom }}</b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showIssueNumbers"
                  v-model="showIssueNumbers"
                />
              </b-col>
              <b-col>
                <label for="showIssueNumbers">{{
                  $t("Show issue numbers")
                }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showPreviousEdge"
                  v-model="showPreviousEdge"
                  :disabled="!edgeIssuecodesBefore.length"
                />
              </b-col>
              <b-col>
                <label for="showPreviousEdge">{{
                  $t("Show previous edge")
                }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showNextEdge"
                  v-model="showNextEdge"
                  :disabled="!edgeIssuecodesAfter.length"
                />
              </b-col>
              <b-col>
                <label for="showNextEdge">{{ $t("Show next edge") }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showEdgePhotos"
                  v-model="showEdgePhotos"
                  :disabled="!hasPhotoUrl"
                />
              </b-col>
              <b-col>
                <label for="showEdgePhotos">{{ $t("Show edge photos") }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showEdgeOverflow"
                  v-model="showEdgeOverflow"
                />
              </b-col>
              <b-col>
                <label for="showEdgeOverflow">{{
                  $t("Show edge overflow")
                }}</label>
              </b-col>
            </b-row>
          </b-collapse>
        </b-navbar>
      </b-col>
      <b-col align-self="center" class="col-sm-4 offset-4">
        <b-button to="/">
          <i-bi-house />
          {{ $t("Home") }}
        </b-button>
      </b-col>
      <b-col />
    </b-row>
    <b-row v-if="publicationIssues" align="center" class="pb-1">
      <b-col v-if="publicationName" align-self="center">
        <issue :issue="publicationIssues[0]" hide-condition no-wrap>
          <template v-if="isEditingMultiple" #title-suffix>
            <template v-if="isRange">
              {{ $t("to") }}
              {{ publicationIssues[publicationIssues.length - 1]!.issuenumber }}
            </template>
            <template v-else-if="issuecodes.length > 1">
              <span
                v-for="otherIssuecode in issuecodes.slice(1)"
                :key="`other-${otherIssuecode}`"
                >,
                {{ publicationIssues.find(({issuecode}) => issuecode === otherIssuecode)!.issuenumber }}</span
              >
            </template>
          </template>
        </issue>

        <template v-if="isEditingMultiple">
          &nbsp;<popover
            id="multiple-issues-hints-popover"
            triggers="hover"
            placement="bottom"
          >
            <i-bi-info-circle-fill variant="secondary" />
            <template #header>
              <b>{{ $t("Multiple-edge modification") }}</b>
            </template>
            <template #content>
              <ul class="py-2 text-start">
                <li>
                  {{
                    $t(
                      "If you want your changes to be applied to a single edge, click on its issue number.",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "If you want to add an edge to the list of edges to apply changes on, click on its issue number while maintaining the Shift key pressed.",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "If you want to apply your changes to all the edges at the same time, double-click on any issue number.",
                    )
                  }}
                </li>
              </ul>
            </template>
          </popover>
        </template>
      </b-col>
    </b-row>
    <b-row align="center" class="p-1">
      <b-col align-self="center">
        &nbsp;<save-model-button />&nbsp;<save-model-button
          v-if="hasRole('Edition')"
          action="submit"
        />
        <save-model-button v-if="hasRole('Admin')" action="export" />
      </b-col>
    </b-row>
    <b-row
      align="center"
      class="p-1"
      style="border-bottom: 1px solid lightgray"
    >
      <b-col align-self="center">
        <multiple-target-options>
          <b-button
            pill
            variant="outline-primary"
            size="sm"
            @click="showPhotoModal = !showPhotoModal"
          >
            <i-bi-camera />
            <b-modal v-model="showPhotoModal" ok-only>
              <confirm-edit-multiple-values
                :is-multiple="uniquePhotoUrls.length > 1"
                @set-to-first-value="
                  setPhotoUrls(photoUrls[issuecodesToEdit[0]])
                "
              >
                <gallery
                  v-model:items="publicationPhotosForGallery"
                  :model-value="photoUrls[issuecodesToEdit[0]]"
                  image-type="photos"
                  @update:model-value="
                    setPhotoUrls
                  " /></confirm-edit-multiple-values
            ></b-modal> </b-button
          >&nbsp;<b-button
            pill
            size="sm"
            variant="outline-primary"
            @click="
              collapseClone = false;
              collapseDimensions = !collapseDimensions;
            "
          >
            <i-bi-arrows-angle-expand /> </b-button
          >&nbsp;<b-button
            pill
            size="sm"
            variant="outline-primary"
            @click="
              collapseDimensions = false;
              collapseClone = !collapseClone;
            "
          >
            <i-bi-front />
          </b-button>
          <b-collapse
            id="collapse-dimensions"
            v-model="collapseDimensions"
            class="mt-2"
          >
            <confirm-edit-multiple-values
              :is-multiple="uniqueDimensions.length > 1"
              @set-to-first-value="editingDimensions = [editingDimensions[0]]"
            >
              <dimensions v-model="editingDimensions[0]" />
            </confirm-edit-multiple-values>
          </b-collapse>
          <b-collapse id="collapse-clone" v-model="collapseClone" class="mt-2">
            <issue-select
              v-if="collapseClone"
              :publicationcode="publicationcode"
              :disable-ongoing-or-published="false"
              with-edge-gallery
              disable-not-ongoing-nor-published
              @change="issuecodeToClone = $event.issuecode"
            />
            <b-button :disabled="!issuecodeToClone" @click="clone">
              {{ $t("Clone") }}
            </b-button>
          </b-collapse>
        </multiple-target-options>
      </b-col>
    </b-row>
    <session-info />
  </b-container>
</template>
<script setup lang="ts">
import surroundingEdge from "~/composables/useSurroundingEdge";
import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import { stores as webStores } from "~web";

const { zoom, showIssueNumbers, showEdgePhotos, showEdgeOverflow } =
  storeToRefs(ui());
const {
  issuecodes,
  publicationIssues,
  photoUrls,
  publicationcode,
  edgeIssuecodesAfter,
  edgeIssuecodesBefore,
  isRange,
  publicationPhotosForGallery,
} = storeToRefs(main());

const { showPreviousEdge, showNextEdge } = surroundingEdge();
const { overwriteModel } = useModelLoad();
const { dimensions: editingDimensions } = storeToRefs(editingStep());
const { hasRole } = webStores.collection();
const stepStore = step();

const { issuecodes: issuecodesToEdit } = storeToRefs(editingStep());

const showPhotoModal = ref(false);
const issuecodeToClone = ref<string>();
const collapseDimensions = ref(false);
const collapseClone = ref(false);

const hasPhotoUrl = computed(() => Object.keys(photoUrls.value).length);
const publicationName = computed(
  () => webStores.coa().publicationNames[publicationcode.value!],
);

const uniquePhotoUrls = computed(() => [
  ...new Set(
    issuecodesToEdit.value.map((issuecode) => photoUrls.value[issuecode]),
  ),
]);

const uniqueDimensions = computed(() =>
  [
    ...new Set(
      Object.values(editingDimensions.value).map(({ width, height }) =>
        JSON.stringify({ width, height }),
      ),
    ),
  ].map((item) => JSON.parse(item) as { width: number; height: number }),
);

const isEditingMultiple = computed(
  () => isRange.value || issuecodes.value.length > 1,
);

const setPhotoUrls = (photoUrl: string) => {
  for (const issuecode of issuecodesToEdit.value) {
    photoUrls.value[issuecode] = photoUrl;
  }
};

const clone = async () => {
  for (const issuecode of issuecodesToEdit.value.filter(
    (issuecode) => issuecode !== issuecodeToClone.value!,
  )) {
    overwriteModel(issuecode, issuecodeToClone.value!, true);
  }
};

watch(
  () => JSON.stringify(editingDimensions.value[0]),
  (dimensions) => {
    const { width, height } = JSON.parse(dimensions);
    stepStore.setDimensions(
      { width, height },
      { issuecodes: issuecodesToEdit.value },
    );
  },
);

webStores.coa().fetchPublicationNames([publicationcode.value!]);
</script>
<style lang="scss">
.options {
  left: 0;

  .navbar {
    > .container-fluid {
      justify-content: start;
    }

    .navbar-toggler {
      box-shadow: none;
    }

    .nav-collapse {
      z-index: 1;
      font-size: small;
      opacity: 0.9;

      .row {
        :not(.zoom-option) {
          height: 25px;
        }

        > :nth-child(1) {
          text-align: center;
        }
      }
    }
  }
}

:deep(svg) {
  vertical-align: sub !important;
  height: 15px;
}

.cursor-position {
  border: 1px solid black;
  z-index: 1;
  right: 0;
  bottom: 0;
}
</style>
