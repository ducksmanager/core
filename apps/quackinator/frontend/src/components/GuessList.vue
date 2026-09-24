<script setup lang="ts">
import { computed, ref } from "vue";

import { formatPercent, isBareCode } from "~quackinator/format";
import type { Guess } from "~quackinator/types";

const props = withDefaults(
  defineProps<{
    guesses: Guess[];
    busy: boolean;
    final: boolean;
    /**
     * Offer "That's the one" beside each rejection.
     *
     * Off for the standalone reader, who has nowhere to put the answer and is
     * told it by the list itself. On for a host that is going to *record* the
     * pick — Dumili writes it to the entry it is indexing — where the reader
     * has to be able to commit to a row rather than just read it.
     */
    pickable?: boolean;
  }>(),
  { pickable: false },
);

const emit = defineEmits<{
  reject: [storycode: string];
  pick: [storycode: string];
}>();

const INDUCKS_STORY = "https://inducks.org/story.php?c=";

/**
 * Scans that did not load. Keyed by URL rather than by storycode: a story keeps
 * its URL as the list reorders, and a mirror that is down fails every row the
 * same way, so one failure per URL is remembered rather than retried on each
 * re-render.
 */
const failed = ref(new Set<string>());

function pictureFor(guess: Guess): string | null {
  const url = guess.thumbnail_url;
  return url && !failed.value.has(url) ? url : null;
}

/**
 * Whether to give every row a picture frame, empty ones included.
 *
 * The 5% of stories nobody has scanned would otherwise shift their title left
 * and break the column, so an empty frame is the lesser evil — but only while
 * some row in the list actually has a picture. Where none does, five empty
 * frames are pure furniture and the list goes back to looking exactly as it did
 * before scans existed: the mirror switched off server-side, or every scan in
 * the shortlist failing to load, which is what a mirror that is down looks like
 * from here.
 */
const showPictures = computed(() =>
  props.guesses.some((guess) => pictureFor(guess)),
);
</script>

<template>
  <section class="panel">
    <h3 class="heading">
      {{ final ? "Best matches" : "Currently most likely" }}
    </h3>

    <p v-if="!guesses.length" class="empty">Nothing narrowed down yet.</p>

    <ol v-else class="list">
      <li v-for="guess in guesses" :key="guess.storycode" class="guess">
        <div
          class="bar"
          :style="{ width: `${Math.max(2, guess.probability * 100)}%` }"
        />
        <div class="row">
          <!-- The reader is holding the drawing, not the title — and a third of
               these stories have no title of their own. The picture is the
               fastest thing in the row to recognise, so it leads it. Left
               unlabelled on purpose: the title beside it already names the
               story, and no alt text conveys a page of comic art. -->
          <div v-if="showPictures" class="thumb">
            <img
              v-if="pictureFor(guess)"
              :src="pictureFor(guess)!"
              alt=""
              loading="lazy"
              decoding="async"
              @error="failed.add(guess.thumbnail_url!)"
            />
          </div>

          <div class="details">
            <div class="body">
              <div class="text">
                <!-- Inducks has no title for some stories and stores the storycode
                     instead; showing it as both title and subtitle reads as a bug. -->
                <a
                  class="title"
                  :class="{ bare: isBareCode(guess.title, guess.storycode) }"
                  :href="`${INDUCKS_STORY}${encodeURIComponent(guess.storycode)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{
                    isBareCode(guess.title, guess.storycode)
                      ? "Untitled story"
                      : guess.title
                  }}</a
                >
                <span class="meta">
                  <span class="mono">{{ guess.storycode }}</span>
                  <template v-if="guess.year"> · {{ guess.year }}</template>
                </span>
              </div>
              <span class="probability">{{
                formatPercent(guess.probability)
              }}</span>
            </div>
            <div class="actions">
              <button
                v-if="pickable"
                type="button"
                class="pick"
                :disabled="busy"
                :title="`This is ${guess.title}`"
                @click="emit('pick', guess.storycode)"
              >
                That's the one
              </button>
              <button
                type="button"
                class="reject"
                :disabled="busy"
                :title="`Not ${guess.title}`"
                @click="emit('reject', guess.storycode)"
              >
                Not this one
              </button>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.pick {
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: none;
  color: var(--accent, #7cc);
  padding: 0.15rem 0.6rem;
}

.pick:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.15rem 1.25rem;
}

.heading {
  margin: 0 0 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.empty {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}

.guess {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
  overflow: hidden;
}

/* Probability as a fill behind the row: readable at a glance without a chart. */
.bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--accent-soft);
  transition: width 0.25s ease;
}

/* Above the probability fill, which is absolutely positioned behind the row. */
.row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
}

.details {
  flex: 1;
  min-width: 0;
}

/* Sized in the aspect ratio of a comic page rather than to the scan, so the
   column holds still while the pictures load — and so a row whose story has no
   scan keeps its place in it. */
.thumb {
  flex: none;
  width: 46px;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-alt);
}

.thumb img {
  width: 100%;
  height: 100%;
  /* The top of a first page is the title panel and the establishing shot: the
     half worth showing at this size. */
  object-fit: cover;
  object-position: top center;
  display: block;
}

.body {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  color: inherit;
  font-weight: 600;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.title:hover {
  text-decoration: underline;
}

.title.bare {
  font-style: italic;
  color: var(--muted);
}

.meta {
  color: var(--muted);
  font-size: 0.8rem;
}

.probability {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  white-space: nowrap;
}

.reject {
  margin-top: 0.45rem;
  background: none;
  border: none;
  padding: 0;
  color: var(--danger);
  font-size: 0.8rem;
  text-decoration: underline;
}
</style>
