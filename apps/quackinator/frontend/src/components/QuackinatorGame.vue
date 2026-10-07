<template>
  <div class="game">
    <p v-if="game.error.value" class="error" role="alert">
      {{ game.error.value }}
      <button type="button" @click="retry">
        {{ t("Try again") }}
      </button>
    </p>

    <template v-if="game.started.value">
      <progress-meter
        :story-entropy-bits="game.storyEntropyBits.value"
        :starting-bits="game.startingBits.value"
        :progress="game.progress.value"
        :confidence="game.confidence.value"
        :questions-asked="game.questionsAsked.value"
        :cover="game.cover.value"
      />

      <main class="layout">
        <div class="main-column">
          <author-box
            v-if="game.creatorOffered.value && !game.done.value"
            :busy="game.busy.value"
            :cover="game.cover.value"
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
                  ? t("I think that's it.")
                  : t("That's as far as I can narrow it.")
              }}
            </h2>
            <i18n-t
              :keypath="
                game.questionsAsked.value
                  ? 'After {count} question, my best match is {title} at {percent} confidence. | After {count} questions, my best match is {title} at {percent} confidence.'
                  : game.cover.value
                    ? 'From the cover alone, my best match is {title} at {percent} confidence.'
                    : 'From the page alone, my best match is {title} at {percent} confidence.'
              "
              :plural="game.questionsAsked.value"
              tag="p"
              scope="parent"
            >
              <template #count>{{ game.questionsAsked.value }}</template>
              <template #title>
                <strong>{{
                  game.guesses.value[0]?.title ?? t("unknown")
                }}</strong>
              </template>
              <template #percent>{{
                formatPercent(game.confidence.value, locale)
              }}</template>
            </i18n-t>
            <p class="muted">
              {{
                game.cover.value
                  ? t(
                      "If none of these is right, reject them and I'll keep going.",
                    )
                  : t(
                      "If none of these is right, reject them and I'll keep going — the one-page gags are genuinely hard to tell apart.",
                    )
              }}
            </p>
          </section>

          <answer-trail :trail="game.trail.value" />
        </div>

        <aside class="side">
          <guess-list
            v-if="game.questionsAsked.value > 0 || game.seeded.value"
            :guesses="game.guesses.value"
            :busy="game.busy.value"
            :final="game.done.value"
            :pickable="pickable"
            :cover="game.cover.value"
            @reject="game.reject"
            @pick="emit('picked', $event)"
          />
        </aside>
      </main>
    </template>

    <p v-else-if="!game.error.value" class="loading">
      {{ t("Loading the story index…") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { I18nT } from "vue-i18n";

import type { Api } from "~quackinator/api";
import AnswerTrail from "~quackinator/components/AnswerTrail.vue";
import AuthorBox from "~quackinator/components/AuthorBox.vue";
import GuessList from "~quackinator/components/GuessList.vue";
import ProgressMeter from "~quackinator/components/ProgressMeter.vue";
import QuestionCard from "~quackinator/components/QuestionCard.vue";
import { type AnswerEvent, useGame } from "~quackinator/composables/useGame";
import { formatPercent } from "~quackinator/format";
import { useQuackinatorI18n } from "~quackinator/i18n";
import type { Seed, Turn } from "~quackinator/types";

const {
  api = undefined,
  initialTurn = undefined,
  seed = undefined,
  pickable = false,
} = defineProps<{
  api?: Api;
  initialTurn?: Turn;
  seed?: Seed;
  pickable?: boolean;
}>();

const emit = defineEmits<{
  (e: "answered", answer: AnswerEvent): void;
  (e: "picked", storycode: string): void;
}>();

const { t, locale } = useQuackinatorI18n();

const game = useGame({
  api,
  initialTurn,
  onAnswered: (answer) => emit("answered", answer),
});

onMounted(() => game.start(seed));

const retry = () => {
  if (game.started.value) {
    game.error.value = null;
  } else {
    void game.start(seed);
  }
};
</script>

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
