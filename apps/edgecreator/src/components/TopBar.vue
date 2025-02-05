<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-start position-absolute col-12 col-md-6 options">
        <b-navbar toggleable class="ps-0 pt-0">
          <b-navbar-brand href="#">
            {{ $t("Options") }}
          </b-navbar-brand>

          <b-navbar-toggle target="nav-collapse" />

          <b-collapse id="nav-collapse" is-nav class="flex-column p-2 bg-white">
            <b-row class="zoom-option">
              <b-col cols="3">
                <input
                  v-model="uiStore.zoom"
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  style="width: 100%"
                />
              </b-col>
              <b-col>{{ $t("Zoom") }}: {{ uiStore.zoom }}</b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showIssueNumbers"
                  v-model="uiStore.showIssueNumbers"
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
                  :disabled="
                    !edgeIssuecodesBefore.length ||
                    showPreviousEdge === undefined
                  "
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
                  :disabled="
                    !edgeIssuecodesAfter.length || showNextEdge === undefined
                  "
                />
              </b-col>
              <b-col>
                <label for="showNextEdge">{{ $t("Show next edge") }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="uiStore.showEdgePhotos"
                  v-model="uiStore.showEdgePhotos"
                  :disabled="
                    !hasPhotoUrl || uiStore.showEdgePhotos === undefined
                  "
                />
              </b-col>
              <b-col>
                <label for="uiStore.showEdgePhotos">{{
                  $t("Show edge photos")
                }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showEdgeOverflow"
                  v-model="uiStore.showEdgeOverflow"
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
    <b-row align="center" class="pb-1">
      <b-col v-if="publicationName" align-self="center">
        <issue :issue="publicationIssues[issuecodes[0]]" hide-condition no-wrap>
          <template v-if="isEditingMultiple" #title-suffix>
            <template v-if="mainStore.isRange">
              {{ $t("to") }}
              {{ publicationIssues![issuecodes[issuecodes.length - 1]]!.issuenumber }}
            </template>
            <template v-else-if="issuecodes.length > 1">
              <span
                v-for="otherIssuecode in issuecodes.slice(1)"
                :key="`other-${otherIssuecode}`"
                >, {{ publicationIssues![otherIssuecode]!.issuenumber }}</span
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
        &nbsp;<b-button
          pill
          variant="outline-primary"
          size="sm"
          @click="showPhotoModal = !showPhotoModal"
        >
          <i-bi-camera />
          <b-modal v-model="showPhotoModal" ok-only>
            <gallery
              image-type="photos"
              :items="mainStore.publicationPhotosForGallery"
              @change="addPhoto"
            />
          </b-modal> </b-button
        >&nbsp;<save-model-button />&nbsp;<save-model-button
          v-if="hasRole('Edition')"
          with-submit
        />
        <save-model-button v-if="hasRole('Admin')" with-export />
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
            <confirm-edit-multiple-values :values="uniqueDimensions">
              <dimensions v-model="editingDimensions[0]" />
            </confirm-edit-multiple-values>
          </b-collapse>
          <b-collapse id="collapse-clone" v-model="collapseClone" class="mt-2">
            <issue-select
              v-if="collapseClone"
              :publicationcode="publicationcode"
              :base-issue-codes="issuecodes"
              :disable-ongoing-or-published="false"
              with-edge-gallery
              disable-not-ongoing-nor-published
              @change="modelToBeCloned = $event"
            />
            <b-button :disabled="!modelToBeCloned" @click="overwriteModel()">
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

const uiStore = ui();
const mainStore = main();
const { loadModel } = useModelLoad();

const { showPreviousEdge, showNextEdge } = surroundingEdge();
const { dimensions: editingDimensions } = storeToRefs(editingStep());
const { hasRole } = webStores.collection();
const stepStore = step();
const {
  issuecodes,
  publicationIssues,
  photoUrls,
  publicationcode,
  edgeIssuecodesAfter,
  edgeIssuecodesBefore,
} = storeToRefs(mainStore);

interface ModelToClone {
  editMode: string;
  issuecode: string;
  issuecodeEnd: string;
}

const showPhotoModal = ref(false);
const modelToBeCloned = ref<ModelToClone>();
const collapseDimensions = ref(false);
const collapseClone = ref(false);

const hasPhotoUrl = computed(() => Object.keys(photoUrls.value).length);
const publicationName = computed(
  () => webStores.coa().publicationNames[publicationcode.value!],
);
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
  () => mainStore.isRange || issuecodes.value.length > 1,
);

const addPhoto = (src: string) => {
  photoUrls.value[issuecodes.value[0]] = src;
};

const overwriteModel = async () => {
  const { issuecode } = modelToBeCloned.value!;
  for (const targetIssuecode of issuecodes.value) {
    try {
      await loadModel(issuecode, targetIssuecode);
    } catch (e) {
      mainStore.addWarning(e as string);
    }
  }
};

watch(
  () => editingDimensions.value[0],
  ({ width, height }) => {
    stepStore.setDimensions(
      { width, height },
      { issuecodes: issuecodes.value },
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
