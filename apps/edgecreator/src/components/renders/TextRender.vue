<template>
  <svg v-if="options.height !== null">
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
import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import useTextTemplate from "~/composables/useTextTemplate";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import { coa } from "~web/src/stores/coa";

const { text: textEvents } = inject(edgecreatorSocketInjectionKey)!;

const { resolveIssueNumberTemplate, resolveIssueNumberPartTemplate } =
  useTextTemplate();

const imageRef = ref<SVGImageElement>();

const {
  issuecode,
  stepNumber,
  options = {
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
  },
} = defineProps<{
  issuecode: string;
  stepNumber: number;
  options?: {
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
}>();

const textImage = ref(
  null as {
    base64?: string | null;
    width: number | null;
    height: number | null;
    url: string;
  } | null,
);
const textImageOptions = ref<typeof options>();

const issuenumber = computed(
  () => coa().issuecodeDetails[issuecode].issuenumber,
);

const effectiveText = computed(() =>
  resolveIssueNumberTemplate(
    options.text,
    resolveIssueNumberPartTemplate(options.text, issuenumber.value),
  ),
);

const { width, attributes, enableDragResize } = useStepOptions(
  {
    issuecode,
    stepNumber,
    options,
  },
  ["x", "y", "width", "height"],
);
const { image, loadImage } = useBase64Legacy();

watch(
  textImage,
  (newValue) => {
    if (newValue) {
      loadImage(textImage.value!.url, (img) => {
        enableDragResize(img, {});
      });
    }
  },
  { immediate: true },
);

watch(
  image,
  (newValue) => {
    if (newValue?.base64) {
      waitUntil(
        () => imageRef.value,
        () => {
          enableDragResize(imageRef.value!, {
            onresizemove: ({ rect }) => {
              let { width, height } = rect;
              const isVertical = [90, 270].includes(options.rotation);
              if (isVertical) {
                [width, height] = [height, width];
              }
              const newOptions: {
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
                newOptions.y =
                  options.y - (newOptions.height - options.height!) / 2;
                newOptions.x =
                  options.x - (newOptions.width - options.width!) / 2;
              }
              step().setOptionValues(options);
            },
          });
          applyTextImageDimensions();
        },
        2000,
        100,
      );
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => options.fgColor,
  async () => {
    await refreshPreview();
  },
);
watch(
  () => options.bgColor,
  async () => {
    await refreshPreview();
  },
);
watch(
  () => options.internalWidth,
  async () => {
    await refreshPreview();
  },
);
watch(
  () => options.text,
  async () => {
    await refreshPreview();
  },
);
watch(
  () => options.font,
  async () => {
    await refreshPreview();
  },
);

const refreshPreview = async () => {
  if (JSON.stringify(textImageOptions.value) === JSON.stringify(options)) {
    return;
  }
  textImageOptions.value = { ...options };
  const { fgColor, bgColor, internalWidth, font } = options;

  const textData = await textEvents.getText({
    color: fgColor.replace("#", ""),
    colorBackground: bgColor.replace("#", ""),
    width: Math.round(internalWidth * 100) / 100,
    font,
    text: effectiveText.value,
  });
  if ("results" in textData) {
    textImage.value = textData.results;
  } else {
    window.alert(textData.error);
  }
};
const waitUntil = (
  condition: () => SVGImageElement | undefined,
  okCallback: () => void,
  timeout: number,
  loopEvery: number,
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
  const newOptions = {
    ...options,
  };
  if (newOptions.height === null) {
    // By default, with a 270° rotation,
    // the text shouldn't be larger than the width of the edge
    // noinspection JSSuspiciousNameCombination
    newOptions.height = 0.8 * width.value;
    newOptions.width = newOptions.height / naturalAspectRatio;
  } else if (options.heightCompression && options.widthCompression) {
    if (options.rotation === 90 || newOptions.rotation === 270) {
      newOptions.height = newOptions.widthCompression! * width.value;
      newOptions.width =
        (newOptions.heightCompression! * width.value) / naturalAspectRatio;
      newOptions.x -= newOptions.width / 2 - newOptions.height / 2;
      newOptions.y += newOptions.width / 2;
    } else {
      newOptions.height =
        newOptions.heightCompression! * width.value * naturalAspectRatio;
      newOptions.width = newOptions.widthCompression! * width.value;
    }
    newOptions.heightCompression = undefined;
    newOptions.widthCompression = undefined;
  }
  newOptions.aspectRatio = newOptions.height / newOptions.width!;
  step().setOptionValues(newOptions, {
    stepNumber: stepNumber,
    issuecodes: [issuecode],
  });
};

(async () => {
  await refreshPreview();
})();
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
