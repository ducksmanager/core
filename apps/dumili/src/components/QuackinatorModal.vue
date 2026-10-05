<template>
  <b-modal
    v-model="show"
    size="xl"
    centered
    :scrollable="step === 'questions'"
    :title="$t('Identifier l\'histoire')"
    @hidden="reset"
  >
    <template v-if="step === 'search'">
      <div class="d-flex gap-3">
        <div class="flex-grow-1">
          <p>
            {{ $t("Si le titre de l'histoire est lisible, recherchez-le :") }}
          </p>
          <div class="search-step">
            <StorySearch @story-selected="onSearchPicked" />
          </div>
        </div>
        <LikelyStories
          v-if="likelyStories.length"
          :stories="likelyStories"
          @pick="onSearchPicked"
        />
      </div>
    </template>

    <template v-else-if="step === 'accepted'">
      <p>
        {{ $t("Histoire identifiée :") }}
        <strong>{{ entry.acceptedStory?.storycode }}</strong>
      </p>
      <p v-if="hasQuestions" class="text-muted">
        {{
          $t(
            "Si vous n'êtes pas sûr, vous pouvez quand même répondre aux questions.",
          )
        }}
      </p>
      <LikelyStories
        v-if="likelyStories.length"
        :stories="likelyStories"
        @pick="onSearchPicked"
      />
    </template>

    <template v-else>
      <p v-if="error" class="text-danger">{{ error }}</p>
      <div v-else-if="!turn" class="text-center p-4">
        {{ $t("Préparation des questions…") }}
      </div>
      <div v-else class="quackinator-surface">
        <QuackinatorGame
          :api="api"
          :initial-turn="turn"
          pickable
          :restartable="false"
          @answered="onAnswered"
          @picked="onPicked"
        />
      </div>
    </template>

    <template #footer>
      <b-button
        v-if="step === 'search' && hasQuestions"
        variant="outline-secondary"
        @click="startQuestions"
        >{{ $t("Pas de titre lisible") }}</b-button
      >
      <b-button
        v-if="step === 'accepted' && hasQuestions"
        variant="outline-secondary"
        @click="startQuestions"
        >{{ $t("Répondre aux questions quand même") }}</b-button
      >
      <b-button
        v-if="step === 'questions' && turn"
        variant="outline-secondary"
        size="sm"
        @click="restart"
        >{{ $t("Recommencer") }}</b-button
      >
      <b-button variant="secondary" @click="show = false">{{
        $t("Fermer")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { createApi } from "~quackinator/api";
import QuackinatorGame from "~quackinator/components/QuackinatorGame.vue";
import type { AnswerEvent } from "~quackinator/composables/useGame";
import type { Turn } from "~quackinator/types";

import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { STORY } from "~dumili-types/storyKinds";
import type { FullEntry } from "~dumili-services/indexation";

const { t: $t } = useI18n();

const entry = defineModel<FullEntry>({ required: true });
const show = defineModel<boolean>("show", { default: false });

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const api = createApi(import.meta.env.VITE_QUACKINATOR_URL ?? "");

const step = ref<"search" | "accepted" | "questions">("search");
const turn = ref<Turn>();
const error = ref<string>();

const hasQuestions = computed(
  () =>
    entry.value.acceptedStoryKind?.storyKindRows?.kind === STORY &&
    !entry.value.includedInEntry,
);

/**
 * Quackinator's own first guesses, from everything Dumili found on the page,
 * so this list and the belief the questions start from cannot disagree. Below
 * this probability a guess is the popularity prior talking, not the page.
 */
const MIN_LIKELY = 0.01;
const likelyStories = computed(() =>
  (turn.value?.guesses ?? [])
    .filter(({ probability }) => probability >= MIN_LIKELY)
    .map(({ storycode, probability }) => ({
      storycode,
      confidence: probability,
    })),
);

const reset = () => {
  step.value = "search";
  turn.value = undefined;
  error.value = undefined;
};

/** Open the session up front: its first turn is what ranks `likelyStories`. */
const openSession = async () => {
  turn.value = undefined;
  const result = await indexationSocket.value!.startQuackinatorSession(
    entry.value.id,
  );
  if ("error" in result) {
    error.value = result.error;
    return;
  }
  turn.value = result.turn;
};

const acceptStory = async (storycode: string) => {
  const existing = entry.value.storySuggestions.find(
    (suggestion) => suggestion.storycode === storycode,
  );
  const suggestionId =
    existing?.id ??
    (
      await indexationSocket.value!.createStorySuggestion({
        entryId: entry.value.id,
        storycode,
        quackinatorSessionId: entry.value.quackinatorSession?.id,
      })
    ).createdStorySuggestion.id;
  await indexationSocket.value!.acceptStorySuggestion(
    entry.value.id,
    suggestionId,
  );
};

const onSearchPicked = async (storycode: string) => {
  await acceptStory(storycode);
  step.value = "accepted";
};

const startQuestions = async () => {
  step.value = "questions";
  if (!turn.value) {
    error.value = undefined;
    await openSession();
  }
};

const onAnswered = (answer: AnswerEvent) => {
  if (answer.family && answer.code) {
    void indexationSocket.value!.recordQuackinatorAnswer(entry.value.id, {
      family: answer.family as "char" | "plot",
      code: answer.code,
      option: answer.option,
    });
  }
};

const onPicked = async (storycode: string) => {
  await acceptStory(storycode);
  show.value = false;
};

const restart = async () => {
  await indexationSocket.value!.resetQuackinatorSession(entry.value.id);
  await openSession();
};

watch(show, (isOpen) => {
  if (isOpen) {
    reset();
    if (hasQuestions.value) {
      void openSession();
    }
  }
});
</script>

<style scoped lang="scss">
.search-step {
  min-height: 19rem;
}

.quackinator-surface {
  --bg: #16181c;
  --surface: #1e2126;
  --surface-alt: #272b32;
  --border: #343941;
  --text: #eceef1;
  --muted: #9aa1ac;
  --accent: #62a8f5;
  --accent-contrast: #10131a;
  --accent-soft: #223145;
  --positive: #63c58c;
  --danger: #f0876f;
  --radius: 12px;
  --shadow: 0 1px 2px rgb(0 0 0 / 30%), 0 6px 20px rgb(0 0 0 / 25%);

  background: var(--bg);
  color: var(--text);
  padding: 1rem;
  border-radius: var(--radius);
}
</style>
