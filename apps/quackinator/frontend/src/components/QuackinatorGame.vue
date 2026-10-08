<template>
  <div class="d-grid gap-4">
    <b-alert
      v-if="game.error.value"
      variant="danger"
      :model-value="true"
      class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-0"
    >
      {{ game.error.value }}
      <b-button variant="outline-danger" size="sm" @click="retry">
        {{ t("Try again") }}
      </b-button>
    </b-alert>

    <template v-if="game.started.value">
      <progress-meter
        :story-entropy-bits="game.storyEntropyBits.value"
        :starting-bits="game.startingBits.value"
        :progress="game.progress.value"
        :confidence="game.confidence.value"
        :questions-asked="game.questionsAsked.value"
        :cover="game.cover.value"
      />

      <b-row tag="main" class="g-4 align-items-start">
        <b-col md="7" class="d-grid gap-3">
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

          <b-card v-else-if="game.done.value">
            <h2 class="h4">
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
            <p class="small text-body-secondary mb-0">
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
          </b-card>

          <answer-trail :trail="game.trail.value" />
        </b-col>

        <b-col tag="aside" md="5">
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
        </b-col>
      </b-row>
    </template>

    <p v-else-if="!game.error.value" class="text-body-secondary">
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
  onAnswered = undefined,
} = defineProps<{
  api?: Api;
  initialTurn?: Turn;
  seed?: Seed;
  pickable?: boolean;
  /** A prop rather than an emit so the game can await it (`@answered` still binds it). */
  onAnswered?: (answer: AnswerEvent) => void | Promise<void>;
}>();

const emit = defineEmits<{
  (e: "picked", storycode: string): void;
}>();

const { t, locale } = useQuackinatorI18n();

const game = useGame({
  api,
  initialTurn,
  onAnswered,
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
