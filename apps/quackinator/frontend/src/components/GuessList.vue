<template>
  <b-card>
    <h3 class="small text-uppercase fw-bold text-body-secondary mb-3">
      {{ final ? t("Best matches") : t("Currently most likely") }}
    </h3>

    <p v-if="!guesses.length" class="small text-body-secondary mb-0">
      {{ t("Nothing narrowed down yet.") }}
    </p>

    <ol v-else class="list-unstyled d-grid gap-2 mb-0">
      <li
        v-for="guess in guesses"
        :key="guess.storycode"
        class="position-relative overflow-hidden border rounded p-2"
      >
        <div
          class="bar"
          :style="{ width: `${Math.max(2, guess.probability * 100)}%` }"
        />
        <div class="position-relative d-flex align-items-start gap-2">
          <div v-if="showPictures" class="thumb border rounded">
            <img
              v-if="pictureFor(guess)"
              :src="pictureFor(guess)!"
              alt=""
              loading="lazy"
              decoding="async"
              @error="failed.add(guess.thumbnail_url!)"
            />
          </div>

          <div class="flex-grow-1 min-w-0">
            <div
              class="d-flex align-items-baseline justify-content-between gap-2"
            >
              <div class="d-flex flex-column min-w-0">
                <a
                  class="fw-semibold link-body-emphasis link-underline-opacity-0 link-underline-opacity-100-hover text-break"
                  :class="{
                    'fst-italic text-body-secondary': isBareCode(
                      guess.title,
                      guess.storycode,
                    ),
                  }"
                  :href="`${INDUCKS_STORY}${encodeURIComponent(guess.storycode)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{
                    isBareCode(guess.title, guess.storycode)
                      ? cover
                        ? t("Untitled cover")
                        : t("Untitled story")
                      : guess.title
                  }}</a
                >
                <span class="small text-body-secondary">
                  <span class="font-monospace">{{ guess.storycode }}</span>
                  <template v-if="guess.year"> · {{ guess.year }}</template>
                </span>
              </div>
              <span class="fw-bold text-nowrap">{{
                formatPercent(guess.probability, locale)
              }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-1">
              <b-button
                v-if="pickable"
                variant="outline-primary"
                size="sm"
                :disabled="busy"
                @click="emit('pick', guess.storycode)"
              >
                {{ t("That's the one") }}
              </b-button>
              <b-button
                variant="link"
                size="sm"
                class="link-danger p-0"
                :disabled="busy"
                :title="t('Not {title}', { title: guess.title })"
                @click="emit('reject', guess.storycode)"
              >
                {{ t("Not this one") }}
              </b-button>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </b-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { formatPercent, isBareCode } from "~quackinator/format";
import { useQuackinatorI18n } from "~quackinator/i18n";
import type { Guess } from "~quackinator/types";

const {
  guesses,
  pickable = false,
  cover = false,
} = defineProps<{
  guesses: Guess[];
  busy: boolean;
  final: boolean;
  /** Hosts that record the pick; the standalone reader has nowhere to put it. */
  pickable?: boolean;
  cover?: boolean;
}>();

const emit = defineEmits<{
  (e: "reject", storycode: string): void;
  (e: "pick", storycode: string): void;
}>();

const { t, locale } = useQuackinatorI18n();

const INDUCKS_STORY = "https://inducks.org/story.php?c=";

// Keyed by URL: a down mirror fails every row the same way, so don't retry per render.
const failed = ref(new Set<string>());

const pictureFor = (guess: Guess): string | null => {
  const url = guess.thumbnail_url;
  return url && !failed.value.has(url) ? url : null;
};

// Empty frames keep titles aligned, but only while at least one row has a picture.
const showPictures = computed(() => guesses.some((guess) => pictureFor(guess)));
</script>

<style scoped>
/* Probability as a fill behind the row */
.bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--bs-primary-bg-subtle);
  transition: width 0.25s ease;
}

/* Comic-page ratio, so the column holds still while scans load */
.thumb {
  flex: none;
  width: 46px;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--bs-tertiary-bg);
}

/* The top of a first page holds the title panel */
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.min-w-0 {
  min-width: 0;
}
</style>
