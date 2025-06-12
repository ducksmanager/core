<template>
  <template v-if="isForm">
    <b-button
      size="sm"
      variant="outline-warning"
      class="d-block my-3 float-end"
      @click="splitImageAcrossEdges()"
    >
      {{
        $t(
          editingIssuecodes.length === 1
            ? "Fill the edge with this image"
            : "Split this image to fit all selected edges",
        )
      }}
    </b-button>
    <div class="clearfix" />
    <form-input-row
      v-model="src"
      option-name="src"
      :label="$t('Image').toString()"
      type="text"
      list-id="src-list"
    >
      <gallery
        v-model="src"
        v-model:items="publicationElementsForGallery"
        image-type="elements"
      />
    </form-input-row>
  </template>
  <svg v-else>
    <image
      v-if="imageDetails"
      ref="image"
      v-bind="{ x, y, width, height }"
      :xlink:href="imageDetails.base64"
      preserveAspectRatio="none"
    >
      <metadata>{{ $props }}</metadata>
    </image>
  </svg>
</template>
<script setup lang="ts">
import useBase64Legacy from "~/composables/useBase64Legacy";

import useTextTemplate from "~/composables/useTextTemplate";
import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import { step } from "~/stores/step";

const { resolveIssueNumberTemplate } = useTextTemplate();

const image = ref<SVGImageElement>();
const { image: imageDetails, loadImage } = useBase64Legacy();
const { issuecodes: editingIssuecodes } = storeToRefs(editingStep());
const { getFilteredDimensions } = step();

const { stepNumber = undefined } = defineProps<{
  stepNumber?: number;
}>();

provide("stepNumber", stepNumber);

const x = defineModel<number>("x", { default: 5 });
const y = defineModel<number>("y", { default: 5 });
const width = defineModel<number>("width", {
  default: 15,
});
const height = defineModel<number>("height", {
  default: 15,
});
const src = defineModel<string>("src", {
  default: "",
});

const isForm = computed(() => stepNumber !== undefined);

const { publicationElementsForGallery, publicationcode } = storeToRefs(main());

const countrycode = computed(() => publicationcode.value!.split("/")[0]);

const splitImageAcrossEdges = () => {
  let leftOffset = 0;
  const widthSum = editingIssuecodes.value.reduce(
    (acc, issuecode) =>
      acc +
      getFilteredDimensions({
        issuecodes: [issuecode],
      })[0].width,
    0,
  );
  for (const issuecode of editingIssuecodes.value) {
    const issueDimensions = getFilteredDimensions({
      issuecodes: [issuecode],
    })[0];
    x.value = leftOffset;
    y.value = 0;
    width.value = widthSum;
    height.value = issueDimensions.height;
    leftOffset -= issueDimensions.width;
  }
};

if (stepNumber === undefined) {
  const issuecode = inject<string>("issuecode");
  if (!issuecode) {
    throw new Error("issuecode not provided");
  }
  const { enableDragResize } = useStepOptions();
  const effectiveSource = computed(() =>
    resolveIssueNumberTemplate(src.value, issuecode),
  );
  watch(
    src,
    () => {
      if (effectiveSource.value) {
        loadImage(
          `${import.meta.env.VITE_EDGES_URL as string}/${
            countrycode.value
          }/elements/${effectiveSource.value}`,
          (img) => {
            enableDragResize(img, {
              x,
              y,
              width,
              height,
            });
          },
        );
      }
    },
    { immediate: true },
  );

  watch(
    image,
    (value) => {
      if (value) {
        enableDragResize(value, {
          x,
          y,
          width,
          height,
        });
      }
    },
    { immediate: true },
  );
}
</script>

<style scoped>
image {
  touch-action: none;
}
</style>
