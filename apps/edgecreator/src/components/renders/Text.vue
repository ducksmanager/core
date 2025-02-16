<template>
  <template v-if="form">
    <form-input-row
      option-name="text"
      :label="$t('Text').toString()"
      type="text"
      :input-values="form.options.text"
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
      option-name="font"
      :label="$t('Font').toString()"
      type="text"
      :input-values="form.options.font"
    >
      <a target="_blank" :href="fontSearchUrl">{{ $t("Search") }}</a>
    </form-input-row>
    <form-color-input-row
      option-name="bgColor"
      :input-values="form.options.bgColor"
      :label="$t('Background color').toString()"
    />
    <form-color-input-row
      :input-values="form.options.fgColor"
      option-name="fgColor"
      :label="$t('Foreground color').toString()"
    />
    <form-input-row
      option-name="rotation"
      :label="
        $t('Rotation : {rotation}°', {
          rotation: form.options.rotation[0],
        }).toString()
      "
      type="range"
      :min="0"
      :max="270"
      :range-step="90"
      :input-values="form.options.rotation"
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
import type { RenderOrForm } from "./RenderOrForm";

const issuecode = inject<string>("issuecode");
if (!issuecode) {
  throw new Error("issuecode not provided");
}

const options = withDefaults(
  defineProps<
    RenderOrForm<{
      x: number;
      y: number;
      width: number | null;
      height: number | null;
      rotation: number;
      fgColor: string;
      bgColor: string;
      font: string;
      text: string;
      internalWidth: number;
      heightCompression?: number;
      widthCompression?: number;
    }>
  >(),
  {
    x: -25,
    y: 50,
    width: null,
    height: null,
    rotation: 270,
    fgColor: "#000000",
    bgColor: "#ffffff",
    font: "redrooster/block-gothic-rr/demi-extra-condensed",
    text: "Le journal de mickey",
    internalWidth: 700,
  },
);

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
  if (!options.form) {
    return;
  }
  for (const issuecode of editingIssuecodes.value) {
    const issueDimensions = getFilteredDimensions({
      issuecodes: [issuecode],
    })[0];
    const aspectRatio = options.form.height[0]! / options.form.width[0]!;
    setOptionValues(
      {
        x: 0,
        y: 0,
        width: issueDimensions.width,
        height: issueDimensions.width * aspectRatio,
      },
      {
        issuecodes: [issuecode],
        stepNumber: options.form.stepNumber,
      },
    );
  }
};

if (!options.form) {
  const effectiveText = computed(() =>
    resolveIssueNumberTemplate(
      options.text,
      resolveIssueNumberPartTemplate(options.text, issuenumber.value),
    ),
  );

  const { width: edgeWidth, enableDragResize } = useStepOptions();
  const { image, loadImage } = useBase64Legacy();

  watch(
    textImage,
    (newValue) => {
      if (newValue) {
        loadImage(textImage.value!.url, (img) => {
          enableDragResize(img, {
            coords: () => ({ x: options.x, y: options.y }),
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
              coords: () => ({ x: options.x, y: options.y }),
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
                  newOptions.y = options.y - (newOptions.height - height) / 2;
                  newOptions.x = options.x - (newOptions.width - width) / 2;
                }
                setOptionValues(options);
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

    const textData = await textEvents.getText({
      color: options.fgColor.replace("#", ""),
      colorBackground: options.bgColor.replace("#", ""),
      width: Math.round(options.internalWidth * 100) / 100,
      font: options.font,
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
    const newOptions = { ...options };
    if (options.height === null) {
      // By default, with a 270° rotation,
      // the text shouldn't be larger than the width of the edge
      // noinspection JSSuspiciousNameCombination
      newOptions.height = 0.8 * edgeWidth.value;
      newOptions.width = newOptions.height / naturalAspectRatio;
    } else if (options.heightCompression && options.widthCompression) {
      if (options.rotation === 90 || options.rotation === 270) {
        newOptions.height = options.widthCompression * edgeWidth.value;
        newOptions.width =
          (options.heightCompression * edgeWidth.value) / naturalAspectRatio;
        newOptions.x -= newOptions.width / 2 - options.height / 2;
        newOptions.y += newOptions.width / 2;
      } else {
        newOptions.height =
          options.heightCompression * edgeWidth.value * naturalAspectRatio;
        newOptions.width = options.widthCompression * edgeWidth.value;
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
