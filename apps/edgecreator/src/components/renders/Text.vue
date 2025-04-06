<template>
  <template v-if="isForm">
    <form-input-row
      v-model="text"
      option-name="text"
      :label="$t('Text').toString()"
      type="text"
      :is-multiple="isMultiple"
    >
      <popover triggers="hover" placement="left">
        <i-bi-info-circle-fill variant="secondary" />
        <template #content>
          <b-alert variant="info" :model-value="true">
            {{
              $t("You can use special text parts to make your text dynamic :")
            }}
            <ul>
              <i18n-t
                tag="li"
                keypath="Write {templateString} to inject in your text the current issue number"
              >
                <template #templateString>
                  <pre class="d-inline-block">[Numero]</pre>
                </template>
              </i18n-t>
              <i18n-t
                tag="li"
                keypath="Write {templateString1} to inject in your text the first digit of the current issue number, {templateString2} for the second digit, etc."
              >
                <template #templateString1>
                  <pre class="d-inline-block">[Numero[0]]</pre>
                </template>
                <template #templateString2>
                  <pre class="d-inline-block">[Numero[1]]</pre>
                </template>
              </i18n-t>
            </ul>
          </b-alert>
        </template>
      </popover>
    </form-input-row>
    <form-input-row
      v-model="font"
      option-name="font"
      :label="$t('Font').toString()"
      type="text"
      :is-multiple="isMultiple"
    >
      <a target="_blank" :href="fontSearchUrl">{{ $t("Search") }}</a>
    </form-input-row>
    <form-color-input-row
      v-model="bgColor"
      option-name="bgColor"
      :is-multiple="isMultiple"
      :label="$t('Background color').toString()"
    />
    <form-color-input-row
      v-model="fgColor"
      :is-multiple="isMultiple"
      option-name="fgColor"
      :label="$t('Foreground color').toString()"
    />
    <form-input-row
      v-model="rotation"
      option-name="rotation"
      :label="
        $t('Rotation : {rotation}°', {
          rotation,
        }).toString()
      "
      type="range"
      :min="0"
      :max="270"
      :range-step="90"
      :is-multiple="isMultiple"
    />
    <b-button
      size="sm"
      variant="outline-warning"
      class="d-block mt-3"
      @click="resetPositionAndSize()"
    >
      {{ $t("Reset position and size") }}
    </b-button>
  </template>
  <svg v-else-if="height !== null">
    <image
      v-if="image"
      ref="imageRef"
      preserveAspectRatio="none"
      v-bind="options as SVGAttributes"
      :xlink:href="image.base64"
      :transform="
        !width
          ? undefined
          : `rotate(${rotation}, ${x + width / 2}, ${y + height / 2})`
      "
    >
      <metadata>{{ options }}</metadata>
    </image>
  </svg>
</template>

<script setup lang="ts">
import type { SVGAttributes } from "vue";
import useBase64Legacy from "~/composables/useBase64Legacy";
import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import useTextTemplate from "~/composables/useTextTemplate";
import { editingStep } from "~/stores/editingStep";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import { coa } from "~web/src/stores/coa";

const issuecode = inject<string>("issuecode");
if (!issuecode) {
  throw new Error("issuecode not provided");
}

const { stepNumber = undefined, isMultiple = false } = defineProps<{
  stepNumber?: number;
  isMultiple?: boolean;
}>();

provide("stepNumber", stepNumber);

const isForm = computed(() => stepNumber !== undefined);

const x = defineModel<number>("x", { default: -25 });
const y = defineModel<number>("y", { default: 50 });
const width = defineModel<number | null>("width", { default: null });
const height = defineModel<number | null>("height", { default: null });
const rotation = defineModel<number>("rotation", { default: 270 });
const fgColor = defineModel<string>("fgColor", { default: "#000000" });
const bgColor = defineModel<string>("bgColor", { default: "#ffffff" });
const font = defineModel<string>("font", {
  default: "redrooster/block-gothic-rr/demi-extra-condensed",
});
const text = defineModel<string>("text", { default: "Le journal de mickey" });
const internalWidth = defineModel<number>("internalWidth", { default: 700 });
const heightCompression = defineModel<number | undefined>("heightCompression", {
  default: undefined,
});
const widthCompression = defineModel<number | undefined>("widthCompression", {
  default: undefined,
});

const options = computed(() => ({
  x: x.value,
  y: y.value,
  width: width.value,
  height: height.value,
  rotation: rotation.value,
  heightCompression: heightCompression.value,
  widthCompression: widthCompression.value,
}));

const textImage = ref<{
  base64?: string | null;
  width: number | null;
  height: number | null;
  url: string;
}>();

const { getFilteredDimensions, setOptionValues } = step();

const fontSearchUrl = computed(
  () => import.meta.env.VITE_FONT_SEARCH_URL as string,
);

const { text: textEvents } = inject(edgecreatorSocketInjectionKey)!;

const { resolveIssueNumberTemplate, resolveIssueNumberPartTemplate } =
  useTextTemplate();

const imageRef = ref<SVGImageElement>();

const textImageOptions = ref<typeof options>();

const issuenumber = computed(
  () => coa().issuecodeDetails[issuecode].issuenumber,
);

const { issuecodes: editingIssuecodes } = storeToRefs(editingStep());

const resetPositionAndSize = () => {
  if (stepNumber === undefined) {
    return;
  }
  for (const issuecode of editingIssuecodes.value) {
    const issueDimensions = getFilteredDimensions({
      issuecodes: [issuecode],
    })[0];
    const aspectRatio = height.value! / width.value!;
    setOptionValues(
      {
        x: 0,
        y: 0,
        width: issueDimensions.width,
        height: issueDimensions.width * aspectRatio,
      },
      {
        issuecodes: [issuecode],
        stepNumber,
      },
    );
  }
};

const { image, loadImage } = useBase64Legacy();

if (!isForm.value) {
  const effectiveText = computed(() =>
    resolveIssueNumberTemplate(
      text.value,
      resolveIssueNumberPartTemplate(text.value, issuenumber.value),
    ),
  );

  const { width: edgeWidth, enableDragResize } = useStepOptions();

  watch(
    textImage,
    (newValue) => {
      if (newValue) {
        loadImage(textImage.value!.url, (img) => {
          enableDragResize(img, {
            coords: () => ({ x: x.value, y: y.value }),
          });
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
              coords: () => ({ x: x.value, y: y.value }),
              onresizemove: ({ rect }) => {
                let { width, height } = rect;
                const isVertical = [90, 270].includes(rotation.value);
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
                  newOptions.y = y.value - (newOptions.height - height) / 2;
                  newOptions.x = x.value - (newOptions.width - width) / 2;
                }
                setOptionValues(newOptions);
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

  watch(fgColor, async () => {
    await refreshPreview();
  });
  watch(bgColor, async () => {
    await refreshPreview();
  });
  watch(internalWidth, async () => {
    await refreshPreview();
  });
  watch(text, async () => {
    await refreshPreview();
  });
  watch(font, async () => {
    await refreshPreview();
  });

  const refreshPreview = async () => {
    if (JSON.stringify(textImageOptions.value) === JSON.stringify(options)) {
      return;
    }
    textImageOptions.value = { ...options };

    const textData = await textEvents.getText({
      color: fgColor.value.replace("#", ""),
      colorBackground: bgColor.value.replace("#", ""),
      width: Math.round(internalWidth.value * 100) / 100,
      font: font.value,
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
    const naturalAspectRatio =
      textImage.value!.height! / textImage.value!.width!;
    const newOptions = { ...options.value };
    if (height.value === null) {
      // By default, with a 270° rotation,
      // the text shouldn't be larger than the width of the edge
      // noinspection JSSuspiciousNameCombination
      newOptions.height = 0.8 * edgeWidth.value;
      newOptions.width = newOptions.height / naturalAspectRatio;
    } else if (heightCompression.value && widthCompression.value) {
      if (rotation.value === 90 || rotation.value === 270) {
        newOptions.height = widthCompression.value * edgeWidth.value;
        newOptions.width =
          (heightCompression.value * edgeWidth.value) / naturalAspectRatio;
        newOptions.x -= newOptions.width / 2 - options.value.height! / 2;
        newOptions.y += newOptions.width / 2;
      } else {
        newOptions.height =
          heightCompression.value * edgeWidth.value * naturalAspectRatio;
        newOptions.width = widthCompression.value * edgeWidth.value;
      }
      newOptions.heightCompression = undefined;
      newOptions.widthCompression = undefined;
    }
    setOptionValues(
      { ...newOptions, aspectRatio: newOptions.height! / newOptions.width! },
      {
        issuecodes: [issuecode],
      },
    );
  };

  (async () => {
    await refreshPreview();
  })();
}
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
