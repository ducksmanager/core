<template>
  <b-alert v-if="error" align="center" variant="danger" :model-value="true">
    {{ error }}
  </b-alert>
  <b-container
    v-else-if="Object.keys(steps).length && Object.keys(dimensions).length"
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
    <top-bar
      :dimensions="editingDimensions"
      @overwrite-model="overwriteModel"
      @set-dimensions="overwriteDimensions"
    />
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
                  v-if="dimensions[issuenumber] && steps[issuenumber]"
                  :issuenumber="issuenumber"
                  :dimensions="dimensions[issuenumber]"
                  :steps="steps[issuenumber]"
                  :photo-url="mainStore.photoUrls[issuenumber]"
                  :contributors="mainStore.contributors[issuenumber] || {}"
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
                      uiStore.zoom * dimensions[issuenumber].height
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
          :dimensions="editingDimensions"
          :steps="editingSteps"
          :all-step-colors="stepColors"
          @add-step="addStep($event)"
          @remove-step="removeStep($event)"
          @duplicate-step="duplicateStep($event)"
          @swap-steps="swapSteps($event)"
        />
      </b-col>
    </b-row>
  </b-container>
</template>
<script setup lang="ts">
import useSurroundingEdge from "~/composables/useSurroundingEdge";
import { edgeCatalog } from "~/stores/edgeCatalog";
import { editingStep } from "~/stores/editingStep";
import { globalEvent } from "~/stores/globalEvent";
import { main } from "~/stores/main";
import { ui } from "~/stores/ui";
import { users } from "~/stores/users";
import { OptionValue } from "~/types/OptionValue";
import { StepsPerIssuenumber } from "~/types/StepsPerIssuenumber";

const route = useRoute();
const uiStore = ui();
const mainStore = main();
const editingStepStore = editingStep();
const { showPreviousEdge, showNextEdge } = useSurroundingEdge();
const {
  addStep,
  removeStep,
  duplicateStep,
  swapSteps,
  steps,
  copyDimensionsAndSteps,
  setSteps,
} = useStepList();
const { loadModel } = useModelLoad();

const error = ref(null as string | null);

const { dimensions, setDimensions } = useDimensions();

const editingDimensions = computed(() =>
  editingStep().issuenumbers.reduce(
    (acc, issuenumber) => ({
      ...acc,
      [issuenumber]: dimensions.value[issuenumber],
    }),
    {}
  )
);

const editingSteps = computed(() =>
  editingStep().issuenumbers.reduce(
    (acc, issuenumber) => ({
      ...acc,
      [issuenumber]: steps.value[issuenumber],
    }),
    {} as StepsPerIssuenumber
  )
);
const isColorOption = (optionName: string) =>
  optionName.toLowerCase().includes("color") ||
  ["fill", "stroke"].includes(optionName);

const stepColors = computed(() =>
  Object.keys(steps.value).reduce(
    (acc, issuenumber) => ({
      ...acc,
      [issuenumber]: steps.value[issuenumber].map((step) => [
        ...new Set(
          Object.keys(step.options || {})
            .filter(
              (optionName) =>
                isColorOption(optionName) &&
                step.options![optionName] !== "transparent"
            )
            .reduce(
              (acc, optionName) => [...acc, step.options![optionName]],
              [] as OptionValue[]
            )
        ),
      ]),
    }),
    {}
  )
);

watch(
  () => editingStep().issuenumbers,
  async (newValue) => {
    if (newValue) {
      await mainStore.loadItems({ itemType: "elements" });
      await mainStore.loadItems({ itemType: "photos" });
      await mainStore.loadSurroundingEdges();
    }
  }
);
watch(
  () => error.value,
  (newValue) => {
    if (newValue) {
      console.trace(newValue);
    }
  }
);

(async () => {
  await users().fetchAllUsers();
  let country, magazine, issuenumberMin, issuenumberMax, issuenumberOthers;
  try {
    const pathParts = (route.params.all as string).split(" ");
    [country, magazine] = pathParts[0].split("/");
    if (pathParts[2] === "to") {
      [, issuenumberMin, , issuenumberMax] = pathParts;
    } else {
      [, issuenumberMin, issuenumberOthers] =
        pathParts[1].match(/^([^,]+),?(.*)$/)!;
    }
  } catch (_) {
    error.value = "Invalid URL";
    return;
  }
  mainStore.country = country;
  mainStore.magazine = magazine;
  editingStep().addIssuenumber(issuenumberMin);

  await mainStore.loadPublicationIssues();

  try {
    debugger;
    mainStore.setIssuenumbers({
      min: issuenumberMin,
      max: issuenumberMax,
      others: issuenumberOthers,
    });

    for (let idx = 0; idx < mainStore.issuenumbers.length; idx++) {
      if (!Object.prototype.hasOwnProperty.call(mainStore.issuenumbers, idx)) {
        continue;
      }
      const issuenumber = mainStore.issuenumbers[idx];
      try {
        await loadModel(country, magazine, issuenumber, issuenumber);
      } catch {
        if (mainStore.issuenumbers[idx - 1]) {
          copyDimensionsAndSteps(issuenumber, mainStore.issuenumbers[idx - 1]);
        } else {
          setDimensions({ width: 15, height: 200 }, issuenumber);
          setSteps(issuenumber, []);
        }
      }
    }
  } catch (e) {
    error.value = e as string;
  }
})();

const overwriteModel = async ({
  publicationCode,
  issueNumber,
}: {
  publicationCode: string;
  issueNumber: string;
}) => {
  const [country, magazine] = publicationCode.split("/");
  for (const targetIssuenumber of editingStep().issuenumbers) {
    try {
      await loadModel(country, magazine, issueNumber, targetIssuenumber);
    } catch (e) {
      mainStore.addWarning(e as string);
    }
  }
};
const overwriteDimensions = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  for (const targetIssuenumber of editingStep().issuenumbers) {
    setDimensions({ width, height }, targetIssuenumber);
  }
};

const getImageUrl = (fileType: string, fileName: string) =>
  `${import.meta.env.VITE_EDGES_URL_PUBLIC}/${mainStore.country}/${
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
  globalEvent().setOptionValues({
    [uiStore.colorPickerOption!]: rgbToHex(color[0], color[1], color[2]),
  });
};

const isPending = (issuenumber: string) =>
  !!edgeCatalog().currentEdges[
    `${mainStore.country}/${mainStore.magazine} ${issuenumber}`
  ];
const isPublished = (issuenumber: string) =>
  !!(edgeCatalog().publishedEdges[
    `${mainStore.country}/${mainStore.magazine}`
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

.clickable {
  cursor: pointer;
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
