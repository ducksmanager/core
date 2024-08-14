<template>
  <b-alert
    v-if="error"
    align="center"
    variant="danger"
    :model-value="true"
  >
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
    <b-row
      class="flex-grow-1 pt-2"
      align-h="end"
    >
      <b-col class="d-flex align-items-end flex-column overflow-auto h-100">
        <table class="edges">
          <tr v-if="uiStore.showIssueNumbers">
            <th
              v-if="
                showPreviousEdge &&
                  mainStore.edgesBefore[mainStore.edgesBefore.length - 1]
              "
              class="surrounding-edge"
            >
              {{
                mainStore.edgesBefore[mainStore.edgesBefore.length - 1]!
                  .issuenumber
              }}
            </th>
            <template
              v-for="issuecode in issuecodes"
              :key="`issuecode-${issuecode}`"
            >
              <th
                :class="{
                  clickable: true,
                  published: isPublished(issuecode),
                  pending: isPending(issuecode),
                }"
                @click.exact="editingStepStore.replaceIssuecode(issuecode)"
                @click.shift="editingStepStore.toggleIssuecode(issuecode)"
                @dblclick="editingStepStore.addIssuecodes(issuecodes)"
              >
                <div v-if="editingStepStore.issuecodes.includes(issuecode)">
                  <i-bi-pencil />
                </div>
                <div>
                  {{ coaStore.issuecodeDetails[issuecode].issuenumber }}
                </div>
              </th>
              <th
                v-if="uiStore.showEdgePhotos && mainStore.photoUrls[issuecode]"
                :key="`photo-icon-${issuecode}`"
              >
                <i-bi-camera />
              </th>
            </template>
            <th
              v-if="showNextEdge && mainStore.edgesAfter[0]"
              class="surrounding-edge"
            >
              {{ mainStore.edgesAfter[0].issuenumber }}
            </th>
          </tr>
          <tr>
            <td v-if="showPreviousEdge && mainStore.edgesBefore.length">
              <published-edge
                :issuecode="
                  mainStore.edgesBefore[mainStore.edgesBefore.length - 1]!
                    .issuecode
                "
                @load="showPreviousEdge = true"
                @error="showPreviousEdge = undefined"
              />
            </td>
            <template
              v-for="issuecode in issuecodes"
              :key="`canvas-${issuecode}`"
            >
              <td>
                <edge-canvas
                  v-if="dimensionsPerIssuecode[issuecode]"
                  :steps="stepsPerIssuecode[issuecode]"
                  :issuecode="issuecode"
                  :dimensions="dimensionsPerIssuecode[issuecode]"
                  :photo-url="mainStore.photoUrls[issuecode]"
                  :contributors="
                    mainStore.contributors.filter(
                      ({ issuecode: thisIssuecode }) =>
                        thisIssuecode === issuecode,
                    )
                  "
                />
              </td>
              <td
                v-if="uiStore.showEdgePhotos && mainStore.photoUrls[issuecode]"
              >
                <img
                  :alt="mainStore.photoUrls[issuecode]"
                  :src="getImageUrl('photos', mainStore.photoUrls[issuecode])"
                  :class="{ picker: !!uiStore.colorPickerOption }"
                  :style="{
                    height: `${
                      uiStore.zoom * dimensionsPerIssuecode[issuecode].height
                    }px`,
                  }"
                  crossorigin=""
                  @click="setColorFromPhoto"
                  @load="uiStore.showEdgePhotos = true"
                  @error="uiStore.showEdgePhotos = undefined"
                >
              </td>
            </template>
            <td v-if="showNextEdge && mainStore.edgesAfter.length">
              <published-edge
                :issuecode="mainStore.edgesAfter[0]!.issuecode"
                @load="showNextEdge = true"
                @error="showNextEdge = undefined"
              />
            </td>
          </tr>
        </table>
      </b-col>
      <b-col
        sm="10"
        md="8"
        lg="6"
      >
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
const { issuecodes } = storeToRefs(mainStore);

const error = ref<string | null>(null);

const { dimensions } = storeToRefs(stepStore);

const dimensionsPerIssuecode = computed(() =>
  issuecodes.value.reduce<Record<string, Dimensions>>(
    (acc, issuecode) => ({
      ...acc,
      [issuecode]: stepStore.getFilteredDimensions({
        issuecodes: [issuecode],
      })[0],
    }),
    {},
  ),
);

const stepsPerIssuecode = computed(() =>
  issuecodes.value.reduce<Record<string, Options>>(
    (acc, issuecode) => ({
      ...acc,
      [issuecode]: stepStore.getFilteredOptions({
        issuecodes: [issuecode],
      }),
    }),
    {},
  ),
);
watch(
  () => editingStepStore.issuecodes,
  async () => {
    await mainStore.loadItems({ itemType: "elements" });
    await mainStore.loadItems({ itemType: "photos" });
    await mainStore.loadSurroundingEdges();
  },
);

try {
  await webStores.users().fetchAllUsers();

  let [firstIssuecode, lastIssuecode] = (route.params.all as string).split(
    " to ",
  );
  let otherIssuecodes: string[] | undefined = undefined;
  if (!lastIssuecode) {
    [firstIssuecode, ...otherIssuecodes] = firstIssuecode.split(",");
  }

  await coaStore.fetchIssuecodeDetails([firstIssuecode]);

  if (!firstIssuecode) {
    throw new Error(`Issue ${firstIssuecode} doesn't exist`);
  }

  await mainStore.loadPublicationIssues();

  try {
    mainStore.setIssuecodes(firstIssuecode!, lastIssuecode, otherIssuecodes);

    editingStepStore.addIssuecode(firstIssuecode!);

    for (const issuecode of issuecodes.value) {
      const idx = issuecodes.value.indexOf(issuecode);
      if (!Object.prototype.hasOwnProperty.call(issuecodes, idx)) {
        continue;
      }
      try {
        await loadModel(firstIssuecode, issuecode);
      } catch {
        const previousIssuecode = issuecodes.value[idx - 1];
        if (previousIssuecode) {
          stepStore.copyDimensionsAndSteps(issuecode, previousIssuecode);
        } else {
          stepStore.setDimensions(
            { width: 15, height: 200 },
            { issuecodes: [issuecode] },
          );

          stepStore.setOptionValues([]);
        }
      }
    }
  } catch (e) {
    error.value = e as string;
  }
} catch (_e) {
  error.value = "Invalid URL";
}

const getImageUrl = (fileType: string, fileName: string) =>
  `${import.meta.env.VITE_EDGES_URL as string}/${mainStore.publicationcode!.split("/")[0]}/${
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

const isPending = (issuecode: string) =>
  !!edgeCatalog().currentEdges[issuecode];
const isPublished = (issuecode: string) =>
  edgeCatalog().publishedEdges[issuecode];

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
