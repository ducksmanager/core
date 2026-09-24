<script setup lang="ts">
/**
 * The game, with nothing around it.
 *
 * `App.vue` is this component plus a page: a heading, a tagline and a footer,
 * which are the standalone site rather than the game. Everything a host embeds
 * is here, and everything here works without one — the standalone app passes no
 * props at all and gets the session it has always had.
 *
 * The two things a host needs that a reader does not are both optional: an
 * `initialTurn`, because a host seeds its session server-side where its own
 * database is, and `pickable`, because a host is going to *record* the answer
 * and so the reader has to be able to commit to a row.
 */
import { onMounted, watch } from "vue";

import type { Api } from "~quackinator/api";
import AnswerTrail from "~quackinator/components/AnswerTrail.vue";
import AuthorBox from "~quackinator/components/AuthorBox.vue";
import GuessList from "~quackinator/components/GuessList.vue";
import ProgressMeter from "~quackinator/components/ProgressMeter.vue";
import QuestionCard from "~quackinator/components/QuestionCard.vue";
import { type AnswerEvent, useGame } from "~quackinator/composables/useGame";
import { formatPercent } from "~quackinator/format";
import type { Turn } from "~quackinator/types";

const props = withDefaults(
  defineProps<{
    /** Defaults to the standalone app's own origin. */
    api?: Api;
    /** A session created elsewhere, already seeded. */
    initialTurn?: Turn;
    /** Offer "That's the one" on each guess. */
    pickable?: boolean;
    /** Let the reader throw the session away and start clean. */
    restartable?: boolean;
  }>(),
  {
    api: undefined,
    initialTurn: undefined,
    pickable: false,
    restartable: true,
  },
);

const emit = defineEmits<{
  /** Every answer as the reader gives it, for a host that stores them. */
  answered: [answer: AnswerEvent];
  /** The reader committed to a guess. */
  picked: [storycode: string];
}>();

const game = useGame({
  api: props.api,
  initialTurn: props.initialTurn,
  onAnswered: (answer) => emit("answered", answer),
});

onMounted(() => game.start());

// A host that swaps in a different session — reopening on another entry —
// should get that session, not the one already on screen.
watch(
  () => props.initialTurn,
  (turn) => turn && game.adopt(turn),
);

defineExpose({ game });
</script>

<template>
  <div class="game">
    <p v-if="game.error.value" class="error" role="alert">
      {{ game.error.value }}
      <button type="button" @click="game.restart()">Try again</button>
    </p>

    <template v-if="game.started.value">
      <progress-meter
        :story-entropy-bits="game.storyEntropyBits.value"
        :starting-bits="game.startingBits.value"
        :progress="game.progress.value"
        :confidence="game.confidence.value"
        :questions-asked="game.questionsAsked.value"
      />

      <main class="layout">
        <div class="main-column">
          <!-- Offered once, ahead of the questions, and it costs no turn:
               the credit is the strongest thing a reader can tell us, but most
               printings do not carry one, so it must be free to wave away. -->
          <author-box
            v-if="game.creatorOffered.value && !game.done.value"
            :busy="game.busy.value"
            @search="(q, resolve) => game.searchCreators(q).then(resolve)"
            @pick="game.nameCreator"
            @dismiss="game.dismissCreator"
          />

          <question-card
            v-else-if="game.question.value"
            :question="game.question.value"
            :busy="game.busy.value"
            :index="game.questionsAsked.value + 1"
            @answer="game.answer"
          />

          <section v-else-if="game.done.value" class="card finished">
            <h2>
              {{
                game.confidence.value >= game.confidenceThreshold.value
                  ? "I think that's it."
                  : "That's as far as I can narrow it."
              }}
            </h2>
            <p>
              After {{ game.questionsAsked.value }} questions, my best match is
              <strong>{{ game.guesses.value[0]?.title ?? "unknown" }}</strong>
              at {{ formatPercent(game.confidence.value) }} confidence.
            </p>
            <p class="muted">
              If none of these is right, reject them and I'll keep going — the
              one-page gags are genuinely hard to tell apart.
            </p>
            <button
              v-if="restartable"
              type="button"
              class="primary"
              @click="game.restart()"
            >
              Identify another story
            </button>
          </section>

          <answer-trail :trail="game.trail.value" />
        </div>

        <aside class="side">
          <!-- Before any answer these are just the popularity prior, all at
               <0.1%, which reads as noise rather than progress. -->
          <guess-list
            v-if="game.questionsAsked.value > 0"
            :guesses="game.guesses.value"
            :busy="game.busy.value"
            :final="game.done.value"
            :pickable="pickable"
            @reject="game.reject"
            @pick="emit('picked', $event)"
          />
          <button
            v-if="restartable"
            type="button"
            class="restart"
            @click="game.restart()"
          >
            Start over
          </button>
        </aside>
      </main>
    </template>

    <p v-else-if="!game.error.value" class="loading">
      Loading the story index…
    </p>
  </div>
</template>

<style scoped>
.game {
  display: grid;
  gap: 1.5rem;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(17rem, 1fr);
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 48rem) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.main-column,
.side {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.finished h2 {
  margin: 0 0 0.6rem;
  font-size: 1.35rem;
}

.finished p {
  margin: 0 0 0.6rem;
}

.muted {
  color: var(--muted);
  font-size: 0.9rem;
}

.primary {
  margin-top: 0.5rem;
  background: var(--accent);
  color: var(--accent-contrast);
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.1rem;
  font-weight: 650;
}

.restart {
  background: none;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  color: var(--muted);
}

.restart:hover {
  color: var(--text);
  border-color: var(--muted);
}

.error {
  background: var(--surface);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  padding: 0.9rem 1.1rem;
  color: var(--danger);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0;
}

.error button {
  background: none;
  border: 1px solid currentcolor;
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
}

.loading {
  color: var(--muted);
}
</style>
