<template>
  <b-container fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-start position-absolute col-12 col-md-6 options">
        <b-navbar toggleable class="ps-0 pt-0">
          <b-navbar-brand href="#">{{ $t("Options") }}</b-navbar-brand>

          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

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
              /></b-col>
              <b-col>{{ $t("Zoom") }}: {{ uiStore.zoom }}</b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showIssueNumbers"
                  v-model="uiStore.showIssueNumbers"
                />
              </b-col>
              <b-col
                ><label for="showIssueNumbers">{{
                  $t("Show issue numbers")
                }}</label></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showPreviousEdge"
                  v-model="showPreviousEdge"
                  :disabled="
                    !mainStore.edgesBefore.length ||
                    showPreviousEdge === undefined
                  "
                />
              </b-col>
              <b-col
                ><label for="showPreviousEdge">{{
                  $t("Show previous edge")
                }}</label></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showNextEdge"
                  v-model="showNextEdge"
                  :disabled="
                    !mainStore.edgesAfter.length || showNextEdge === undefined
                  "
                />
              </b-col>
              <b-col
                ><label for="showNextEdge">{{
                  $t("Show next edge")
                }}</label></b-col
              >
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
              <b-col
                ><label for="uiStore.showEdgePhotos">{{
                  $t("Show edge photos")
                }}</label></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="3">
                <b-form-checkbox
                  id="showEdgeOverflow"
                  v-model="uiStore.showEdgeOverflow"
                />
              </b-col>
              <b-col
                ><label for="showEdgeOverflow">{{
                  $t("Show edge overflow")
                }}</label></b-col
              >
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
        <issue
          :publicationcode="`${mainStore.country}/${mainStore.magazine}`"
          :publicationname="publicationName"
          :issuenumber="mainStore.issuenumbers[0]"
          hide-condition
          no-wrap
        >
          <template v-if="isEditingMultiple" #title-suffix>
            <template v-if="mainStore.isRange"
              >{{ $t("to") }}
              {{ mainStore.issuenumbers[mainStore.issuenumbers.length - 1] }}
            </template>
            <template v-else-if="mainStore.issuenumbers.length > 1"
              ><span
                v-for="otherIssuenumber in mainStore.issuenumbers.slice(1)"
                :key="`other-${otherIssuenumber}`"
                >, {{ otherIssuenumber }}</span
              ></template
            ></template
          >
        </issue>

        <template v-if="isEditingMultiple">
          &nbsp;<popover
            id="multiple-issues-hints-popover"
            triggers="hover"
            placement="bottom"
          >
            <i-bi-info-circle-fill variant="secondary" />
            <template #header
              ><b>{{ $t("Multiple-edge modification") }}</b></template
            >
            <template #content
              ><ul class="py-2 text-start">
                <li>
                  {{
                    $t(
                      "If you want your changes to be applied to a single edge, click on its issue number."
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "If you want to add an edge to the list of edges to apply changes on, click on its issue number while maintaining the Shift key pressed."
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "If you want to apply your changes to all the edges at the same time, double-click on any issue number."
                    )
                  }}
                </li>
              </ul></template
            >
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
              <dimensions
                :width="uniqueDimensions[0].width"
                :height="uniqueDimensions[0].height"
                @change="$emit('set-dimensions', $event)"
              />
            </confirm-edit-multiple-values>
          </b-collapse>
          <b-collapse id="collapse-clone" v-model="collapseClone" class="mt-2">
            <issue-select
              v-if="collapseClone"
              :country-code="mainStore.country"
              :publication-code="`${mainStore.country}/${mainStore.magazine}`"
              :base-issue-numbers="mainStore.issuenumbers"
              :disable-ongoing-or-published="false"
              edge-gallery
              disable-not-ongoing-nor-published
              @change="modelToClone = $event"
            />
            <b-button
              :disabled="!modelToClone"
              @click="emit('overwrite-model', modelToClone)"
              >{{ $t("Clone") }}
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
import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { main } from "~/stores/main";
import { ui } from "~/stores/ui";

const uiStore = ui();
const mainStore = main();

const { showPreviousEdge, showNextEdge } = surroundingEdge();
const { hasRole } = collection();

interface ModelToClone {
  editMode: string;
  countryCode: string;
  publicationCode: string;
  issueNumber: string;
  issueNumberEnd: string;
}

const emit = defineEmits<{
  (e: "overwrite-model", value: ModelToClone | null): void;
  (e: "set-dimensions", value: { width: number; height: number }): void;
}>();

const props = defineProps<{
  dimensions: {
    width: number;
    height: number;
  };
}>();

const showPhotoModal = ref(false as boolean);
const modelToClone = ref(null as ModelToClone | null);
const collapseDimensions = ref(false as boolean);
const collapseClone = ref(false as boolean);

const hasPhotoUrl = computed(() => Object.keys(mainStore.photoUrls).length);
const publicationName = computed(
  () => coa().publicationNames[`${mainStore.country!}/${mainStore.magazine!}`]
);
const uniqueDimensions = computed(() =>
  [
    ...new Set(
      Object.values(props.dimensions).map((item) => JSON.stringify(item))
    ),
  ].map((item) => JSON.parse(item) as { width: number; height: number })
);

const isEditingMultiple = computed(
  () => mainStore.isRange || mainStore.issuenumbers.length > 1
);

const addPhoto = (src: string) => {
  mainStore.photoUrls[mainStore.issuenumbers[0]] = src;
};

coa().fetchPublicationNames([`${mainStore.country!}/${mainStore.magazine!}`]);
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
