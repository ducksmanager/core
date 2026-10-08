<template>
  <b-card>
    <h2 class="h4">{{ t("Got a photo of the story's first page?") }}</h2>
    <p class="text-body-secondary">
      {{
        t(
          "If it's a story I've seen before I may recognise it straight away. If not, I'll still use the layout and the title to pick better questions.",
        )
      }}
    </p>

    <b-form @submit.prevent="analyze">
      <b-form-group :label="t('First page')" label-for="first-page">
        <input
          id="first-page"
          class="form-control"
          type="file"
          accept="image/*"
          capture="environment"
          :disabled="busy"
          @change="pick"
        />
      </b-form-group>

      <b-form-group
        :label="t('Language of the magazine')"
        label-for="magazine-language"
        class="mt-3"
      >
        <b-form-select
          id="magazine-language"
          v-model="language"
          :options="languageOptions"
          :disabled="busy"
        />
        <template #description>
          {{
            t(
              "Used to read the story's title off the page, if I don't recognise the image. A title is written in the magazine's language, so I need to know which one to read it in.",
            )
          }}
        </template>
      </b-form-group>

      <b-alert v-if="error" variant="danger" :model-value="true" class="mt-3">
        {{ error }}
      </b-alert>

      <div class="d-flex flex-wrap gap-2 mt-3">
        <b-button type="submit" variant="primary" :disabled="!file || busy">
          {{ busy ? t("Looking at the page…") : t("Look at the page") }}
        </b-button>
        <b-button
          variant="secondary"
          :disabled="busy"
          @click="emit('seed', undefined)"
        >
          {{ t("Skip, just ask me questions") }}
        </b-button>
      </div>
    </b-form>
  </b-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { api } from "~quackinator/api";
import { useQuackinatorI18n } from "~quackinator/i18n";
import { findSimilarImages } from "~quackinator/storySearch";
import type { Seed } from "~quackinator/types";

const emit = defineEmits<{
  /** undefined when skipped or nothing was found */
  (e: "seed", seed: Seed | undefined): void;
}>();

// Inducks language codes.
const LANGUAGES = [
  "it",
  "fr",
  "de",
  "nl",
  "da",
  "no",
  "sv",
  "fi",
  "en",
  "es",
  "pt",
  "el",
  "pl",
  "cs",
  "hu",
  "is",
  "tr",
  "id",
  "ru",
];

const { t, locale } = useQuackinatorI18n();

const languageName = (code: string) =>
  new Intl.DisplayNames([locale.value], { type: "language" }).of(code) ?? code;

const languageOptions = computed(() => [
  { value: null, text: t("Don't know (skip reading the title)") },
  ...LANGUAGES.map((code) => ({ value: code, text: languageName(code) })),
]);

const browserLanguage = navigator.language.split("-")[0];
const file = ref<File | null>(null);
const language = ref<string | null>(
  LANGUAGES.includes(browserLanguage) ? browserLanguage : null,
);
const busy = ref(false);
const error = ref<string | null>(null);

const pick = (event: Event) => {
  file.value = (event.target as HTMLInputElement).files?.[0] ?? null;
};

const shrink = async (image: File, maxSide: number) => {
  const bitmap = await createImageBitmap(image);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
};

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encoding failed"))),
      "image/jpeg",
      0.9,
    ),
  );

const analyze = async () => {
  if (!file.value) return;
  busy.value = true;
  error.value = null;
  try {
    // Image search's socket takes 1MB at most; OCR needs enough resolution to read a title.
    const [small, large] = await Promise.all([
      shrink(file.value, 800),
      shrink(file.value, 2000),
    ]);
    const [matches, { kumiko, ocr }] = await Promise.all([
      // Optional: without it, the layout and the title still seed the game.
      findSimilarImages(small.toDataURL("image/jpeg", 0.85)).catch((e) => {
        console.warn("Image search failed", e);
        return [];
      }),
      toBlob(large).then((blob) => api.analyze(blob, language.value)),
    ]);

    const seed: Seed = {};
    if (matches.length) {
      seed.image_matches = matches;
    }
    if (kumiko.pages.some((page) => page !== null)) {
      seed.kumiko = kumiko;
    }
    if (ocr.length) {
      seed.ocr = ocr;
    }
    emit("seed", Object.keys(seed).length ? seed : undefined);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
};
</script>
