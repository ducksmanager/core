<template>
  <b-alert v-if="error" align="center" variant="danger" :model-value="true">
    {{ error }}
  </b-alert>
  <b-container
    v-else-if="stepStore.options && Object.keys(dimensions).length"
    id="wrapper"
    fluid
  >
    <b-alert
      v-for="(warning, idx) in mainStore.warnings"
      :key="`warning-${idx}`"
      align="center"
      dismissible
      variant="warning"
      :model-value="true"
      @dismissed="mainStore.removeWarning(idx)"
    >
      {{ warning }}
    </b-alert>
    <top-bar />
    <position-helper />
    <b-row class="flex-grow-1 pt-2" align-h="end">
      <b-col class="d-flex align-items-end flex-column overflow-auto h-100">
        <table class="edges">
          <tr v-if="uiStore.showIssueNumbers">
            <th
              v-if="showPreviousEdge && mainStore.edgesBefore.length"
              class="surrounding-edge"
            >
              {{
                mainStore.edgesBefore[mainStore.edgesBefore.length - 1]
                  .issuenumber
              }}
            </th>
            <template
              v-for="issuenumber in mainStore.issuenumbers"
              :key="`issuenumber-${issuenumber}`"
            >
              <th
                :class="{
                  clickable: true,
                  published: isPublished(issuenumber),
                  pending: isPending(issuenumber),
                }"
                @click.exact="editingStepStore.replaceIssuenumber(issuenumber)"
                @click.shift="editingStepStore.toggleIssuenumber(issuenumber)"
                @dblclick="
                  editingStepStore.addIssuenumbers(mainStore.issuenumbers)
                "
              >
                <div v-if="editingStepStore.issuenumbers.includes(issuenumber)">
                  <i-bi-pencil />
                </div>
                <div>
                  {{ issuenumber }}
                </div>
              </th>
              <th
                v-if="
                  uiStore.showEdgePhotos && mainStore.photoUrls[issuenumber]
                "
                :key="`photo-icon-${issuenumber}`"
              >
                <i-bi-camera />
              </th>
            </template>
            <th
              v-if="showNextEdge && mainStore.edgesAfter.length"
              class="surrounding-edge"
            >
              {{ mainStore.edgesAfter[0].issuenumber }}
            </th>
          </tr>
          <tr>
            <td v-if="showPreviousEdge && mainStore.edgesBefore.length">
              <published-edge
                :issuenumber="
                  mainStore.edgesBefore[mainStore.edgesBefore.length - 1]
                    .issuenumber
                "
                @load="showPreviousEdge = true"
                @error="showPreviousEdge = undefined"
              />
            </td>
            <template
              v-for="issuenumber in mainStore.issuenumbers"
              :key="`canvas-${issuenumber}`"
            >
              <td>
                <edge-canvas
                  v-if="dimensionsPerIssuenumber[issuenumber]"
                  :steps="stepsPerIssuenumber[issuenumber]"
                  :issuenumber="issuenumber"
                  :dimensions="dimensionsPerIssuenumber[issuenumber]"
                  :photo-url="mainStore.photoUrls[issuenumber]"
                  :contributors="
                    mainStore.contributors.filter(
                      ({ issuenumber: thisIssuenumber }) =>
                        thisIssuenumber === issuenumber,
                    )
                  "
                />
              </td>
              <td
                v-if="
                  uiStore.showEdgePhotos && mainStore.photoUrls[issuenumber]
                "
              >
                <img
                  :alt="mainStore.photoUrls[issuenumber]"
                  :src="getImageUrl('photos', mainStore.photoUrls[issuenumber])"
                  :class="{ picker: !!uiStore.colorPickerOption }"
                  :style="{
                    height: `${
                      uiStore.zoom *
                      dimensionsPerIssuenumber[issuenumber].height
                    }px`,
                  }"
                  crossorigin=""
                  @click="setColorFromPhoto"
                  @load="uiStore.showEdgePhotos = true"
                  @error="uiStore.showEdgePhotos = undefined"
                />
              </td>
            </template>
            <td v-if="showNextEdge && mainStore.edgesAfter.length">
              <published-edge
                :issuenumber="mainStore.edgesAfter[0].issuenumber"
                @load="showNextEdge = true"
                @error="showNextEdge = undefined"
              />
            </td>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <model-edit
          @add-step="stepStore.addStep"
          @remove-step="stepStore.removeStep"
          @duplicate-step="stepStore.duplicateStep"
          @swap-steps="stepStore.swapSteps"
        />
      </b-col>
    </b-row>
  </b-container>
</template>
<script setup lang="ts">
import useSurroundingEdge from "~/composables/useSurroundingEdge";
import { edgeCatalog } from "~/stores/edgeCatalog";
import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import type { Dimensions, Options } from "~/stores/step";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import { stores as webStores } from "~web";
import { coa } from "~web/src/stores/coa";

const route = useRoute();
const uiStore = ui();
const mainStore = main();
const coaStore = coa();
const stepStore = step();
const editingStepStore = editingStep();
const { showPreviousEdge, showNextEdge } = useSurroundingEdge();

const { loadModel } = useModelLoad();

const error = ref<string | null>(null);

const { dimensions } = storeToRefs(stepStore);

const dimensionsPerIssuenumber = computed(() =>
  mainStore.issuenumbers.reduce<Record<string, Dimensions>>(
    (acc, issuenumber) => ({
      ...acc,
      [issuenumber]: stepStore.getFilteredDimensions({
        issuenumbers: [issuenumber],
      })[0],
    }),
    {},
  ),
);

const stepsPerIssuenumber = computed(() =>
  mainStore.issuenumbers.reduce<Record<string, Options>>(
    (acc, issuenumber) => ({
      ...acc,
      [issuenumber]: stepStore.getFilteredOptions({
        issuenumbers: [issuenumber],
      }),
    }),
    {},
  ),
);
watch(
  () => editingStepStore.issuenumbers,
  async () => {
    await mainStore.loadItems({ itemType: "elements" });
    await mainStore.loadItems({ itemType: "photos" });
    await mainStore.loadSurroundingEdges();
  },
);

try {
  await webStores.users().fetchAllUsers();

  let [firstIssuecode, lastIssuenumber] = (route.params.all as string).split(
    " to ",
  );
  let otherIssuenumbers: string[] | undefined = undefined;
  if (!lastIssuenumber) {
    [firstIssuecode, ...otherIssuenumbers] = firstIssuecode.split(",");
  }

  await coaStore.fetchIssueCodesDetails([firstIssuecode]);

  const { publicationcode, issuenumber: firstIssuenumber } =
    coaStore.issueCodeDetails[firstIssuecode];
  if (!publicationcode) {
    throw new Error(`Issue ${firstIssuecode} doesn't exist`);
  }
  [mainStore.country, mainStore.magazine] = publicationcode!.split("/");

  await mainStore.loadPublicationIssues();

  try {
    mainStore.setIssuenumbers(
      firstIssuenumber!,
      lastIssuenumber,
      otherIssuenumbers,
    );

    editingStepStore.addIssuenumber(firstIssuenumber!);

    for (const issuenumber of mainStore.issuenumbers) {
      const idx = mainStore.issuenumbers.indexOf(issuenumber);
      if (!Object.prototype.hasOwnProperty.call(mainStore.issuenumbers, idx)) {
        continue;
      }
      try {
        await loadModel(
          mainStore.country,
          mainStore.magazine,
          issuenumber,
          issuenumber,
        );
      } catch {
        const previousIssuenumber = mainStore.issuenumbers[idx - 1];
        if (previousIssuenumber) {
          stepStore.copyDimensionsAndSteps(issuenumber, previousIssuenumber);
        } else {
          stepStore.setDimensions(
            { width: 15, height: 200 },
            { issuenumbers: [issuenumber] },
          );

          stepStore.setOptionValues([]);
        }
      }
    }
  } catch (e) {
    error.value = e as string;
  }
} catch (e) {
  error.value = "Invalid URL";
}

const getImageUrl = (fileType: string, fileName: string) =>
  `${import.meta.env.VITE_EDGES_URL as string}/${mainStore.country!}/${
    fileType === "elements" ? fileType : "photos"
  }/${fileName}`;

const setColorFromPhoto = ({ target, offsetX, offsetY }: MouseEvent) => {
  const imgElement = target as HTMLImageElement;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  context.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
  const color = context.getImageData(offsetX, offsetY, 1, 1).data;
  stepStore.setOptionValues({
    [uiStore.colorPickerOption!]: rgbToHex(color[0], color[1], color[2]),
  });
};

const isPending = (issuenumber: string) =>
  !!edgeCatalog().currentEdges[
    `${mainStore.country!}/${mainStore.magazine!} ${issuenumber}`
  ];
const isPublished = (issuenumber: string) =>
  (edgeCatalog().publishedEdges[
    `${mainStore.country!}/${mainStore.magazine!}`
  ] || {})[issuenumber];

const rgbToHex = (r: number, g: number, b: number) =>
  `#${((r << 16) | (g << 8) | b).toString(16)}`;
</script>
<style lang="scss" scoped>
#wrapper {
  display: flex;
  flex-direction: column;
  user-select: none;
}

.alert-warning {
  margin-left: 350px;
  margin-right: 150px;
}

.picker {
  cursor: crosshair;
}

table.edges {
  margin-left: auto !important; /* https://stackoverflow.com/a/37515194/2847079 */
  tr {
    > * {
      text-align: center;
      vertical-align: bottom;
    }
    td {
      padding: 0;
    }
    th {
      padding: 1px 2px;

      &.published {
        background: green;
      }

      &.pending {
        background: orange;
      }

      &.surrounding-edge {
        font-weight: normal;
      }
    }
  }
}
</style>
