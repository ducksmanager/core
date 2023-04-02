<!--suppress RequiredAttributes, HtmlUnknownAttribute -->
<template>
  <svg>
    <image
      v-if="image"
      ref="image"
      v-bind="options"
      :xlink:href="base64"
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

const image = ref(null as SVGImageElement | null);
const { image: base64, loadImage } = useBase64Legacy();

interface Props {
  issuenumber: string;
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
  resolveIssueNumberTemplate(props.options.src!, props.issuenumber)
);

watch(
  () => props.options.src,
  async () => {
    if (effectiveSource.value) {
      loadImage(
        `${import.meta.env.VITE_EDGES_URL_PUBLIC}/${main().country}/elements/${
          effectiveSource.value
        }`,
        (img) => {
          enableDragResize(img, {});
        }
      );
    }
  },
  { immediate: true }
);

onMounted(async () => {
  enableDragResize(image.value!);
});

const { enableDragResize } = useStepOptions(props, [
  "x",
  "y",
  "width",
  "height",
]);
</script>

<style scoped>
image {
  touch-action: none;
}
</style>
