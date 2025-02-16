<template>
  <template v-if="form">
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
      option-name="src"
      :label="$t('Image').toString()"
      type="text"
      list-id="src-list"
      :input-values="form.src"
    >
      <gallery
        v-model:selected="form.src[0]"
        v-model:items="publicationElementsForGallery"
        image-type="elements"
      />
    </form-input-row>
  </template>
  <svg v-else>
    <image
      v-if="imageDetails"
      ref="image"
      v-bind="$props as SVGAttributes"
      :xlink:href="imageDetails.base64"
      preserveAspectRatio="none"
    >
      <metadata>{{ $props }}</metadata>
    </image>
  </svg>
</template>
<script setup lang="ts">
import type { SVGAttributes } from "vue";
import useBase64Legacy from "~/composables/useBase64Legacy";

import useTextTemplate from "~/composables/useTextTemplate";
import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import { step } from "~/stores/step";
import type { RenderOrForm } from "./RenderOrForm";

const { resolveIssueNumberTemplate } = useTextTemplate();

const image = ref<SVGImageElement>();
const { image: imageDetails, loadImage } = useBase64Legacy();
const { issuecodes: editingIssuecodes } = storeToRefs(editingStep());
const { setOptionValues, getFilteredDimensions } = step();

const options = withDefaults(
  defineProps<
    RenderOrForm<{
      x: number;
      y: number;
      width: number;
      height: number;
      src?: string;
    }>
  >(),
  {
    x: 5,
    y: 5,
    width: 15,
    height: 15,
    src: "",
  },
);

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
    setOptionValues(
      {
        x: leftOffset,
        y: 0,
        width: widthSum,
        height: issueDimensions.height,
      },
      { issuecodes: [issuecode] },
    );
    leftOffset -= issueDimensions.width;
  }
};

if (options.form) {
  const selectedGalleryItem = ref<string>();

  watch(
    () => options.form.src,
    (srcValues) => {
      selectedGalleryItem.value = srcValues?.[0];
    },
    { immediate: true },
  );

  watch(
    selectedGalleryItem,
    (selectedGalleryItem) => {
      if (selectedGalleryItem) {
        setOptionValues(
          { src: selectedGalleryItem },
          {
            stepNumber: options.form.stepNumber,
          },
        );
      }
    },
    { deep: true },
  );
} else {
  const issuecode = inject<string>("issuecode");
  if (!issuecode) {
    throw new Error("issuecode not provided");
  }
  const { enableDragResize } = useStepOptions();
  const effectiveSource = computed(() =>
    resolveIssueNumberTemplate(options.src, issuecode),
  );
  watch(
    () => options.src,
    () => {
      if (effectiveSource.value) {
        loadImage(
          `${import.meta.env.VITE_EDGES_URL as string}/${
            countrycode.value
          }/elements/${effectiveSource.value}`,
          (img) => {
            enableDragResize(img, {
              coords: () => ({ x: options.x, y: options.y }),
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
          coords: () => ({
            x: options.x,
            y: options.y,
          }),
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
