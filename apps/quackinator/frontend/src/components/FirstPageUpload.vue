<template>
  <section class="card upload">
    <h2>Got a photo of the story's first page?</h2>
    <p class="muted">
      If it's a story I've seen before I may recognise it straight away. If not,
      I'll still use the layout and the title to pick better questions.
    </p>

    <form @submit.prevent="analyze">
      <label class="field">
        <span>First page</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          :disabled="busy"
          @change="pick"
        />
      </label>

      <label class="field">
        <span>Language of the magazine</span>
        <select v-model="language" :disabled="busy">
          <option :value="null">Don't know (skip reading the title)</option>
          <option v-for="[code, name] in LANGUAGES" :key="code" :value="code">
            {{ name }}
          </option>
        </select>
      </label>

      <div class="actions">
        <button type="submit" class="primary" :disabled="!file || busy">
          {{ busy ? "Looking at the page…" : "Look at the page" }}
        </button>
        <button type="button" :disabled="busy" @click="emit('seed', undefined)">
          Skip, just ask me questions
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
 * asking once the seeded belief is confident — and every failure here falls
 * back to the questions.
 *
 * Not part of `QuackinatorGame`: a host like Dumili already holds the page and
 * seeds the session itself.
 */
import { ref } from "vue";

import { api } from "~quackinator/api";
import { findSimilarImages } from "~quackinator/storySearch";
import type { Seed } from "~quackinator/types";

const emit = defineEmits<{
  /** Undefined when the reader skipped, or nothing could be found. */
  (e: "seed", seed: Seed | undefined): void;
}>();

// Inducks language codes, the ones Disney comics are mostly printed in.
const LANGUAGES: [string, string][] = [
  ["it", "Italian"],
  ["fr", "French"],
  ["de", "German"],
  ["nl", "Dutch"],
  ["da", "Danish"],
  ["no", "Norwegian"],
  ["sv", "Swedish"],
  ["fi", "Finnish"],
  ["en", "English"],
  ["es", "Spanish"],
  ["pt", "Portuguese"],
  ["el", "Greek"],
  ["pl", "Polish"],
  ["cs", "Czech"],
  ["hu", "Hungarian"],
  ["is", "Icelandic"],
  ["tr", "Turkish"],
  ["id", "Indonesian"],
  ["ru", "Russian"],
];

const browserLanguage = navigator.language.split("-")[0];
const file = ref<File | null>(null);
const language = ref<string | null>(
  LANGUAGES.some(([code]) => code === browserLanguage) ? browserLanguage : null,
);
const busy = ref(false);

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
  try {
    // Image search embeds at 224px and its socket takes 1MB at most; Kumiko
    // and OCR want enough resolution to read a title.
    const [small, large] = await Promise.all([
      shrink(file.value, 800),
      shrink(file.value, 2000),
    ]);
    const [matches, analysis] = await Promise.allSettled([
      findSimilarImages(small.toDataURL("image/jpeg", 0.85)),
      toBlob(large).then((blob) => api.analyze(blob, language.value)),
    ]);

    const seed: Seed = {};
    if (matches.status === "fulfilled" && matches.value) {
      seed.image_matches = matches.value;
    } else if (matches.status === "rejected") {
      console.warn("Image search failed", matches.reason);
    }
    if (analysis.status === "fulfilled") {
      seed.kumiko = analysis.value.kumiko;
      seed.ocr = analysis.value.ocr;
      if (analysis.value.errors.length) {
        console.warn("Page analysis incomplete", analysis.value.errors);
      }
    } else {
      console.warn("Page analysis failed", analysis.reason);
    }
    emit("seed", Object.keys(seed).length ? seed : undefined);
  } catch (e) {
    console.warn("Could not read the photo", e);
    emit("seed", undefined);
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
