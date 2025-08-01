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
      v-for="(warning, idx) in warnings"
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
          <tbody>
            <tr v-if="showIssueNumbers">
              <th
                v-if="
                  showPreviousEdge &&
                  edgeIssuecodesBefore[edgeIssuecodesBefore.length - 1]
                "
                class="surrounding-edge"
              >
                {{
                  coa().issuecodeDetails[
                    edgeIssuecodesBefore[edgeIssuecodesBefore.length - 1]
                  ]?.issuenumber
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
                    ongoing: isOngoing(issuecode),
                  }"
                  @click.exact="editingStepStore.replaceIssuecode(issuecode)"
                  @click.shift="editingStepStore.toggleIssuecode(issuecode)"
                  @dblclick="editingStepStore.addIssuecodes(issuecodes)"
                >
                  <div v-if="editingStepStore.issuecodes.includes(issuecode)">
                    <i-bi-pencil />
                  </div>
                  <div>
                    {{
                      publicationIssues!.find(({issuecode: thisIssuecode}) => issuecode === thisIssuecode)!.issuenumber
                    }}
                  </div>
                </th>
                <th
                  v-if="showEdgePhotos && photoUrls[issuecode]"
                  :key="`photo-icon-${issuecode}`"
                >
                  <i-bi-camera />
                </th>
              </template>
              <th
                v-if="showNextEdge && edgeIssuecodesAfter[0]"
                class="surrounding-edge"
              >
                {{
                  coa().issuecodeDetails[
                    edgeIssuecodesAfter[edgeIssuecodesAfter.length - 1]
                  ]?.issuenumber
                }}
              </th>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <td v-if="showPreviousEdge && edgeIssuecodesBefore.length">
                <published-edge
                  :issuecode="
                    edgeIssuecodesBefore[edgeIssuecodesBefore.length - 1]!
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
                    :photo-url="photoUrls[issuecode]"
                    :contributors="
                      Array.from(contributors).filter(
                        ({ issuecode: thisIssuecode }) =>
                          thisIssuecode === issuecode,
                      )
                    "
                  />
                </td>
                <td v-if="showEdgePhotos && photoUrls[issuecode]">
                  <img
                    :alt="photoUrls[issuecode]"
                    :src="
                      getImageUrl(countrycode, 'photos', photoUrls[issuecode])
                    "
                    :class="{ picker: !!colorPickerOption }"
                    :style="{
                      height: `${
                        zoom * dimensionsPerIssuecode[issuecode].height
                      }px`,
                    }"
                    crossorigin=""
                    @click="setColorFromPhoto"
                  />
                </td>
              </template>
              <td v-if="showNextEdge && edgeIssuecodesAfter.length">
                <published-edge
                  :issuecode="edgeIssuecodesAfter[0]!"
                  @load="showNextEdge = true"
                  @error="showNextEdge = undefined"
                />
              </td>
            </tr>
          </tbody>
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
import useModelLoad from "~/composables/useModelLoad";
import useSurroundingEdge from "~/composables/useSurroundingEdge";
import { edgeCatalog } from "~/stores/edgeCatalog";
import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import { stores as webStores } from "~web";

const route = useRoute();
const { showIssueNumbers, showEdgePhotos, colorPickerOption, zoom } =
  storeToRefs(ui());

const mainStore = main();

const stepStore = step();
const editingStepStore = editingStep();
const { showPreviousEdge, showNextEdge } = useSurroundingEdge();

const { loadModel } = useModelLoad();
const {
  publicationcode,
  publicationIssues,
  issuecodes,
  edgeIssuecodesAfter,
  edgeIssuecodesBefore,
  warnings,
  photoUrls,
  contributors,
} = storeToRefs(mainStore);

const countrycode = computed(() => publicationcode.value!.split("/")[0]);

const error = ref<string>();

const { dimensions } = storeToRefs(stepStore);

const dimensionsPerIssuecode = computed(() =>
  issuecodes.value.groupBy(
    null,
    null,
    (issuecode) =>
      stepStore.getFilteredDimensions({
        issuecodes: [issuecode],
      })[0],
  ),
);

const stepsPerIssuecode = computed(() =>
  issuecodes.value.groupBy(null, null, (issuecode) =>
    stepStore.getFilteredOptions({
      issuecodes: [issuecode],
    }),
  ),
);
watch(
  () => editingStepStore.issuecodes,
  async () => {
    await mainStore.loadItems({ itemType: "elements" });
    await mainStore.loadItems({ itemType: "photos" });
  },
);

try {
  await webStores.users().fetchAllUsers();

  const issuecodeParams = (route.params.all as string).replaceAll("_", " ");

  let [firstIssuecode, lastIssuecode] = issuecodeParams.split(" to ");
  let otherIssuecodes: string[] | undefined = undefined;
  if (!lastIssuecode) {
    [firstIssuecode, ...otherIssuecodes] = firstIssuecode.split(",");
  }

  await coa().fetchIssuecodeDetails([firstIssuecode]);
  publicationcode.value =
    coa().issuecodeDetails[firstIssuecode]?.publicationcode;

  await coa().fetchIssuecodesByPublicationcode([publicationcode.value]);
  await coa().fetchIssuecodeDetails(
    coa().issuecodesByPublicationcode[publicationcode.value],
  );

  if (!publicationcode.value) {
    throw new Error(`Issue ${firstIssuecode} doesn't exist`);
  }

  await mainStore.loadPublicationIssues();
  edgeCatalog().fetchPublishedEdges(publicationcode.value);

  try {
    const errors = mainStore.setIssuecodes(
      firstIssuecode,
      lastIssuecode,
      otherIssuecodes,
    );

    if (errors) {
      error.value = errors.join("\n");
    }

    editingStepStore.addIssuecode(firstIssuecode);

    for (const issuecode of issuecodes.value) {
      const idx = issuecodes.value.indexOf(issuecode);
      try {
        await loadModel(issuecode);

        if (
          !stepStore.options.some(
            ({ issuecode: thisIssuecode }) => thisIssuecode === issuecode,
          )
        ) {
          throw new Error(`no options found for issue code ${issuecode}`);
        }
      } catch {
        const previousIssuecode = issuecodes.value[idx - 1];
        console.log(
          "Could not load model for",
          issuecode,
          "falling back to previous issuecode",
          previousIssuecode,
        );
        if (previousIssuecode) {
          stepStore.setDimensions(
            stepStore.dimensions.find(
              ({ issuecode: thisIssuecode }) =>
                previousIssuecode === thisIssuecode,
            ),
            { issuecodes: [issuecode] },
          );
          stepStore.overwriteSteps(
            issuecode,
            stepStore.options
              .filter(({ issuecode }) => issuecode === previousIssuecode)
              .map((option) => ({
                ...option,
                issuecode,
              })),
          );
        } else {
          if (
            !stepStore.dimensions.some(
              ({ issuecode: thisIssuecode }) => issuecode === thisIssuecode,
            )
          ) {
            stepStore.setDimensions(
              { width: 15, height: 200 },
              { issuecodes: [issuecode] },
            );
          }

          stepStore.setOptionValues([], {
            issuecodes: [issuecode],
          });
        }
      }
    }
  } catch (e) {
    error.value = e as string;
  }
} catch (e) {
  error.value = e as string;
}

const getImageUrl = (
  countrycode: string,
  fileType: "elements" | "photos" | "gen",
  fileName: string,
) =>
  `${import.meta.env.VITE_EDGES_URL as string}/${countrycode}/${
    fileType
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
    [colorPickerOption.value!]: rgbToHex(color[0], color[1], color[2]),
  });
};

const isOngoing = (issuecode: string) =>
  !!edgeCatalog().ongoingEdges[issuecode];
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

      &.ongoing {
        background: orange;
      }

      &.surrounding-edge {
        font-weight: normal;
      }
    }
  }
}
</style>
