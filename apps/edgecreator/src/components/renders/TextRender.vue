<!--suppress RequiredAttributes, HtmlUnknownAttribute -->
<template>
  <svg v-if="options.x !== undefined && options.height !== null">
    <image
      v-if="image"
      ref="imageRef"
      preserveAspectRatio="none"
      v-bind="attributes"
      :xlink:href="image.base64"
      :transform="
        !options.width
          ? undefined
          : `rotate(${options.rotation}, ${options.x + options.width / 2}, ${
              options.y + options.height / 2
            })`
      "
    >
      <metadata>{{ options }}</metadata>
    </image>
  </svg>
</template>

<script setup lang="ts">
import useBase64Legacy from "~/composables/useBase64Legacy";
import useTextTemplate from "~/composables/useTextTemplate";
import { api } from "~/stores/api";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import { GET__fs__text } from "~types/routes";

import { call } from "../../../axios-helper";

const { resolveIssueNumberTemplate, resolveIssueNumberPartTemplate } =
  useTextTemplate();

const imageRef = ref(null as SVGImageElement | null);

interface Props {
  issuenumber: string;
  stepNumber: number;
  options: {
    x: number;
    y: number;
    width: number | null;
    height: number | null;
    src: string | null;
    rotation: number;
    fgColor: string;
    bgColor: string;
    font: string;
    text: string;
    internalWidth: number;
    isHalfHeight: true;
    heightCompression?: number;
    widthCompression?: number;
    aspectRatio: number;
  };
}
const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    x: -25,
    y: 50,
    width: null,
    height: null,
    src: null,
    rotation: 270,
    fgColor: "#000000",
    bgColor: "#ffffff",
    font: "redrooster/block-gothic-rr/demi-extra-condensed",
    text: "Le journal de mickey",
    internalWidth: 700,
    isHalfHeight: true,
    aspectRatio: 1,
  }),
});

const textImage = ref(
  null as {
    base64?: string | null;
    width: number | null;
    height: number | null;
    url: string;
  } | null
);
const textImageOptions = ref(null as typeof props.options | null);

const effectiveText = computed(() =>
  resolveIssueNumberTemplate(
    props.options.text,
    resolveIssueNumberPartTemplate(props.options.text, props.issuenumber)
  )
);

const { width, attributes, enableDragResize } = useStepOptions(props, "Text", [
  "x",
  "y",
  "width",
  "height",
]);
const { image, loadImage } = useBase64Legacy();

watch(
  () => textImage.value,
  async (newValue) => {
    if (newValue) {
      loadImage(textImage.value!.url, (img) => {
        enableDragResize(img, {});
      });
    }
  },
  { immediate: true }
);

watch(
  () => image.value,
  (newValue) => {
    if (newValue?.base64) {
      waitUntil(
        () => imageRef.value,
        () => {
          enableDragResize(imageRef.value!, {
            onresizemove: ({ rect }) => {
              let { width, height } = rect;
              const isVertical = [90, 270].includes(props.options.rotation);
              if (isVertical) {
                [width, height] = [height, width];
              }
              const options: {
                x?: number;
                y?: number;
                width: number;
                height: number;
              } = {
                width: width / ui().zoom,
                height: height / ui().zoom,
              };

              // Correct coordinates due to rotation center moving after resize
              if (isVertical) {
                options.y =
                  props.options.y -
                  (options.height - props.options.height!) / 2;
                options.x =
                  props.options.x - (options.width - props.options.width!) / 2;
              }
              step().setOptionValues(options);
            },
          });
          applyTextImageDimensions();
        },
        2000,
        100
      );
    }
  },
  {
    immediate: true,
  }
);

watch(
  () => props.options.fgColor,
  () => {
    refreshPreview();
  }
);
watch(
  () => props.options.bgColor,
  () => {
    refreshPreview();
  }
);
watch(
  () => props.options.internalWidth,
  () => {
    refreshPreview();
  }
);
watch(
  () => props.options.text,
  () => {
    refreshPreview();
  }
);
watch(
  () => props.options.font,
  () => {
    refreshPreview();
  }
);

const refreshPreview = async () => {
  if (
    JSON.stringify(textImageOptions.value) === JSON.stringify(props.options)
  ) {
    return;
  }
  textImageOptions.value = { ...props.options };
  const { fgColor, bgColor, internalWidth, font } = props.options;
  try {
    textImage.value = (
      await call(
        api().edgeCreatorApi,
        new GET__fs__text({
          query: {
            color: fgColor.replace("#", ""),
            colorBackground: bgColor.replace("#", ""),
            width: Math.round(internalWidth * 100) / 100,
            font,
            text: effectiveText.value,
          },
        })
      )
    ).data;
  } catch (e) {
    console.error(`Text image could not be retrieved`);
  }
};
const waitUntil = (
  condition: () => SVGImageElement | null,
  okCallback: () => void,
  timeout: number,
  loopEvery: number
) => {
  let iterations = 0;
  const interval = setInterval(() => {
    if (condition()) {
      okCallback();
      clearInterval(interval);
    }
    if (++iterations > timeout / loopEvery) {
      clearInterval(interval);
    }
  }, loopEvery);
};

const applyTextImageDimensions = () => {
  const naturalAspectRatio = textImage.value!.height! / textImage.value!.width!;
  const options = {
    ...props.options,
  };
  if (options.height === null) {
    // By default, with a 270° rotation,
    // the text shouldn't be larger than the width of the edge
    // noinspection JSSuspiciousNameCombination
    options.height = 0.8 * width.value;
    options.width = options.height / naturalAspectRatio;
  } else if (options.heightCompression && options.widthCompression) {
    if (props.options.rotation === 90 || options.rotation === 270) {
      options.height = options.widthCompression * width.value;
      options.width =
        (options.heightCompression * width.value) / naturalAspectRatio;
      options.x -= options.width / 2 - options.height / 2;
      options.y += options.width / 2;
    } else {
      options.height =
        options.heightCompression * width.value * naturalAspectRatio;
      options.width = options.widthCompression * width.value;
    }
    options.heightCompression = undefined;
    options.widthCompression = undefined;
  }
  options.aspectRatio = options.height / options.width!;
  step().setOptionValues(options);
};

refreshPreview();
</script>

<style scoped lang="scss">
image {
  touch-action: none;
  visibility: hidden;

  &[width] {
    visibility: visible;
  }
}
</style>
