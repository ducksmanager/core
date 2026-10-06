<template>
  <section class="card upload">
    <h2>{{ t("Got a photo of the story's first page?") }}</h2>
    <p class="muted">
      {{
        t(
          "If it's a story I've seen before I may recognise it straight away. If not, I'll still use the layout and the title to pick better questions.",
        )
      }}
    </p>

    <form @submit.prevent="analyze">
      <label class="field">
        <span>{{ t("First page") }}</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          :disabled="busy"
          @change="pick"
        />
      </label>

      <label class="field">
        <span>{{ t("Language of the magazine") }}</span>
        <select v-model="language" :disabled="busy">
          <option :value="null">
            {{ t("Don't know (skip reading the title)") }}
          </option>
          <option v-for="code in LANGUAGES" :key="code" :value="code">
            {{ languageName(code) }}
          </option>
        </select>
      </label>

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <div class="actions">
        <button type="submit" class="primary" :disabled="!file || busy">
          {{ busy ? t("Looking at the page…") : t("Look at the page") }}
        </button>
        <button type="button" :disabled="busy" @click="emit('seed', undefined)">
          {{ t("Skip, just ask me questions") }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
/**
 * The standalone reader's way in: a photo of the first page, run through
 * reverse image search (DM, from the browser), Kumiko and OCR (this API) before
 * the first question. A clear match needs nothing else — the engine stops
 * asking once the seeded belief is confident. A failure is shown to the reader,
 * who can retry or skip.
 *
 * Not part of `QuackinatorGame`: a host like Dumili already holds the page and
 * seeds the session itself.
 */
import { ref } from "vue";

import { api } from "~quackinator/api";
import { useQuackinatorI18n } from "~quackinator/i18n";
import { findSimilarImages } from "~quackinator/storySearch";
import type { Seed } from "~quackinator/types";

const emit = defineEmits<{
  /** Undefined when the reader skipped, or nothing could be found. */
  (e: "seed", seed: Seed | undefined): void;
}>();

// Inducks language codes, the ones Disney comics are mostly printed in.
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

/** In the reader's own language, which the browser knows how to name. */
const languageName = (code: string) =>
  new Intl.DisplayNames([locale.value], { type: "language" }).of(code) ?? code;

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

/** The photo, no larger than `maxSide` on its longest side, as a JPEG. */
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
    // Image search embeds at 224px and its socket takes 1MB at most; Kumiko
    // and OCR want enough resolution to read a title.
    const [small, large] = await Promise.all([
      shrink(file.value, 800),
      shrink(file.value, 2000),
    ]);
    const [matches, { kumiko, ocr }] = await Promise.all([
      findSimilarImages(small.toDataURL("image/jpeg", 0.85)).catch((e) => {
        throw new Error(
          t("Image search failed: {reason}", { reason: (e as Error).message }),
        );
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

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.upload h2 {
  margin: 0 0 0.4rem;
}

.muted {
  color: var(--muted);
  margin: 0 0 1.25rem;
}

form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field span {
  font-weight: 600;
  font-size: 0.9rem;
}

.field input,
.field select {
  max-width: 100%;
}

.error {
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  padding: 0.9rem 1.1rem;
  color: var(--danger);
  margin: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
