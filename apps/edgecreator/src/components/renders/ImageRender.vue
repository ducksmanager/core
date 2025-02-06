<!--suppress RequiredAttributes, HtmlUnknownAttribute -->
<template>
  <svg>
    <image
      v-if="imageDetails"
      ref="image"
      v-bind="options"
      :xlink:href="imageDetails.base64"
      preserveAspectRatio="none"
    >
      <metadata>{{ options }}</metadata>
    </image>
  </svg>
</template>

<script setup lang="ts">
import useBase64Legacy from "~/composables/useBase64Legacy";
import useTextTemplate from "~/composables/useTextTemplate";
import { main } from "~/stores/main";

const { resolveIssueNumberTemplate } = useTextTemplate();

const image = ref<SVGImageElement>();
const { image: imageDetails, loadImage } = useBase64Legacy();

interface Props {
  issuecode: string;
  stepNumber: number;
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    src: string | null;
  };
}
const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    x: 5,
    y: 5,
    width: 15,
    height: 15,
    src: "",
  }),
});

const effectiveSource = computed(() =>
  resolveIssueNumberTemplate(props.options.src!, props.issuecode),
);

const countrycode = computed(() => main().publicationcode!.split("/")[0]);

const { enableDragResize } = useStepOptions(props, [
  "x",
  "y",
  "width",
  "height",
]);

watch(
  () => props.options.src,
  () => {
    if (effectiveSource.value) {
      loadImage(
        `${import.meta.env.VITE_EDGES_URL as string}/${
          countrycode.value
        }/elements/${effectiveSource.value}`,
        (img) => {
          enableDragResize(img, {});
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
      enableDragResize(value);
    }
  },
  { immediate: true },
);
</script>

<style scoped>
image {
  touch-action: none;
}
</style>
