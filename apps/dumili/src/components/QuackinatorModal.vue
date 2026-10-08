<template>
  <Teleport to="#quackinator-anchor" defer>
    <div v-if="show" class="quackinator-panel card text-bg-dark">
      <div class="card-header d-flex align-items-center">
        <h5 class="m-0 flex-grow-1">
          {{
            isCover
              ? $t("Identifier la couverture")
              : $t("Identifier l'histoire")
          }}
        </h5>
        <b-button
          class="btn-close btn-close-white"
          variant="link"
          :aria-label="$t('Fermer')"
          @click="show = false"
        />
      </div>

      <div class="card-body overflow-auto">
        <template v-if="step === 'choose'">
          <b-alert v-if="!firstPageImage" variant="warning" :model-value="true">
            {{
              $t(
                "Aucune image n'a été envoyée pour la première page de cette entrée : la recherche par image n'a pas pu être effectuée.",
              )
            }}
          </b-alert>
          <LikelyStories
            v-if="aiSuggestions.length"
            class="mb-3"
            :title="$t('Suggestions à partir de la première page')"
            :stories="aiSuggestions"
            :selected="entry.acceptedStory?.storycode"
            @pick="onSuggestionPicked"
          />
          <p v-else-if="firstPageImage" class="text-muted">
            {{
              $t(
                "La recherche par image et la lecture du texte de la première page n'ont rien trouvé.",
              )
            }}
          </p>
          <p
            v-if="
              entry.acceptedStory &&
              !aiSuggestions.some(
                ({ storycode }) => storycode === entry.acceptedStory!.storycode,
              )
            "
          >
            {{
              isCover
                ? $t("Couverture identifiée :")
                : $t("Histoire identifiée :")
            }}
            <strong>{{ entry.acceptedStory.storycode }}</strong>
          </p>
          <div class="d-flex flex-column gap-2">
            <b-button variant="outline-light" @click="step = 'title'">{{
              isCover
                ? $t("Je connais le titre ou le code de la couverture")
                : $t("Je connais le titre ou le code de l'histoire")
            }}</b-button>
            <template v-if="identifiable">
              <b-button variant="outline-light" @click="startQuestions">{{
                isCover
                  ? $t("Identifier la couverture en répondant à des questions")
                  : $t("Identifier l'histoire en répondant à des questions")
              }}</b-button>
              <b-alert
                v-if="missingReleaseDate"
                variant="info"
                :model-value="true"
                class="mb-0"
              >
                {{
                  $t(
                    "Renseignez la date de parution du numéro : l'identification par questions sera plus rapide.",
                  )
                }}
              </b-alert>
            </template>
          </div>
        </template>

        <div v-else-if="step === 'title'" class="search-step">
          <StorySearch @story-selected="onTitlePicked" />
        </div>

        <template v-else>
          <p v-if="error" class="text-danger">{{ error }}</p>
          <div v-else-if="!turn" class="text-center p-4">
            {{ $t("Préparation des questions…") }}
          </div>
          <QuackinatorGame
            v-else
            :api="api"
            :initial-turn="turn"
            pickable
            @answered="onAnswered"
            @picked="onPicked"
          />
        </template>
      </div>

      <div class="card-footer d-flex justify-content-end gap-2">
        <b-button
          v-if="step !== 'choose'"
          variant="outline-secondary"
          @click="reset"
          >{{ $t("Retour") }}</b-button
        >
        <b-button
          v-if="step === 'questions' && turn"
          variant="outline-secondary"
          @click="restart"
          >{{ $t("Recommencer") }}</b-button
        >
        <b-button variant="secondary" @click="show = false">{{
          $t("Fermer")
        }}</b-button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { createApi } from "~quackinator/api";
import QuackinatorGame from "~quackinator/components/QuackinatorGame.vue";
import type { AnswerEvent } from "~quackinator/composables/useGame";
import type { Turn } from "~quackinator/types";

import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { COVER, STORY } from "~dumili-types/storyKinds";
import type { FullEntry } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";
import { releaseYear } from "~dumili-utils/releaseYear";
import { suggestions } from "~/stores/suggestions";

const { t: $t } = useI18n();

const entry = defineModel<FullEntry>({ required: true });
const show = defineModel<boolean>("show", { default: false });

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const api = createApi(import.meta.env.VITE_QUACKINATOR_URL ?? "");

const step = ref<"choose" | "title" | "questions">("choose");
const turn = ref<Turn>();
const error = ref<string>();

const { indexation } = storeToRefs(suggestions());

const isCover = computed(
  () => entry.value.acceptedStoryKind?.storyKindRows?.kind === COVER,
);

const identifiable = computed(
  () =>
    [STORY, COVER].includes(
      entry.value.acceptedStoryKind?.storyKindRows?.kind ?? "",
    ) && !entry.value.includedInEntry,
);

const missingReleaseDate = computed(
  () => identifiable.value && !releaseYear(indexation.value!),
);

const firstPageImage = computed(
  () => getEntryPages(indexation.value!, entry.value.id)[0]?.image,
);

// Found by both first, then image score, then OCR score.
const aiSuggestions = computed(() => {
  const image = firstPageImage.value;
  const scores = new Map<string, { image?: number; ocr?: number }>();
  const add = (
    source: "image" | "ocr",
    stories: { score: number; aiStorySuggestion: { id: number } | null }[],
  ) => {
    for (const { score, aiStorySuggestion } of stories) {
      const storycode = entry.value.storySuggestions.find(
        ({ aiStorySuggestionId }) =>
          aiStorySuggestionId === aiStorySuggestion?.id,
      )?.storycode;
      if (storycode) {
        scores.set(storycode, { ...scores.get(storycode), [source]: score });
      }
    }
  };
  add("image", image?.aiStorySearchResult?.stories ?? []);
  add("ocr", image?.aiOcrResult?.stories ?? []);
  const rank = ({ image, ocr }: { image?: number; ocr?: number }) => [
    image !== undefined && ocr !== undefined ? 1 : 0,
    image ?? -1,
    ocr ?? -1,
  ];
  return [...scores]
    .sort(([, a], [, b]) => {
      const [ra, rb] = [rank(a), rank(b)];
      return rb[0] - ra[0] || rb[1] - ra[1] || rb[2] - ra[2];
    })
    .map(([storycode, { image, ocr }]) => ({
      storycode,
      sources: [
        ...(image !== undefined
          ? [$t("Image : {score} %", { score: Math.round(image * 100) })]
          : []),
        // OCR scores are already out of 100.
        ...(ocr !== undefined
          ? [$t("Texte : {score} %", { score: Math.round(ocr) })]
          : []),
      ],
    }));
});

const reset = () => {
  step.value = "choose";
  turn.value = undefined;
  error.value = undefined;
};

let sessionStart: Promise<void> | undefined;

// De-duplicate concurrent opens; the server may wait for the AI pipeline.
const openSession = () =>
  (sessionStart ??= (async () => {
    turn.value = undefined;
    error.value = undefined;
    try {
      const result = await indexationSocket.value!.startQuackinatorSession(
        entry.value.id,
      );
      if ("error" in result) {
        error.value = result.error;
      } else {
        turn.value = result.turn;
      }
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      sessionStart = undefined;
    }
  })());

const acceptStory = async (storycode: string, fromQuackinator: boolean) => {
  const existing = entry.value.storySuggestions.find(
    (suggestion) => suggestion.storycode === storycode,
  );
  const suggestionId =
    existing?.id ??
    (
      await indexationSocket.value!.createStorySuggestion({
        entryId: entry.value.id,
        storycode,
        quackinatorSessionId: fromQuackinator
          ? entry.value.quackinatorSession?.id
          : undefined,
      })
    ).createdStorySuggestion.id;
  await indexationSocket.value!.acceptStorySuggestion(
    entry.value.id,
    suggestionId,
  );
  // `entry` is a draft saved back whole; without this the next save would undo the pick.
  const live = indexation.value?.entries.find(
    ({ id }) => id === entry.value.id,
  );
  if (live) {
    entry.value.storySuggestions = live.storySuggestions;
    entry.value.acceptedStory = live.acceptedStory;
  }
};

const onSuggestionPicked = (storycode: string) => acceptStory(storycode, false);

const onTitlePicked = async (storycode: string) => {
  await acceptStory(storycode, false);
  step.value = "choose";
};

const startQuestions = async () => {
  step.value = "questions";
  if (!turn.value) {
    await openSession();
  }
};

const onAnswered = async (answer: AnswerEvent) => {
  if (!answer.family || !answer.code) return;
  const result = await indexationSocket.value!.recordQuackinatorAnswer(
    entry.value.id,
    {
      family: answer.family as "char" | "plot",
      code: answer.code,
      option: answer.option,
    },
  );
  if ("error" in result) {
    throw new Error(result.error);
  }
};

const onPicked = async (storycode: string) => {
  await acceptStory(storycode, true);
  show.value = false;
};

const restart = async () => {
  await indexationSocket.value!.resetQuackinatorSession(entry.value.id);
  await openSession();
};

watch(show, (isOpen) => {
  if (isOpen) {
    reset();
  }
});
</script>

<style scoped lang="scss">
.quackinator-panel {
  position: absolute;
  inset: 0;
  padding: 0;
  z-index: 10;
  user-select: text;
}

.search-step {
  min-height: 19rem;
}
</style>
