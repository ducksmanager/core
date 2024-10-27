<template>
  <b-row class="d-flex w-100 align-items-center">
    <template v-if="editable">
      <b-col col cols="3">
        <suggestion-list
          v-model="entry.acceptedStoryKind"
          :suggestions="entry.storyKindSuggestions"
          :is-ai-source="(suggestion) => suggestion.aiSourcePageId !== null"
          :item-class="(suggestion) => [`kind-${suggestion.kind}`]"
        >
          <template #item="suggestion">
            {{ getStoryKind(suggestion.kind) }}
          </template>
          <template #unknown-text>{{ $t("Type inconnu") }}</template>
        </suggestion-list> </b-col
      ><b-col col cols="3"><StorySuggestionList v-model="entry" /></b-col>
      <b-col col cols="3">
        <b-form-input
          placeholder="Titre de l'histoire"
          type="text"
          class="w-100"
          :value="entry.title || ''" /></b-col
      ><b-col col cols="3">
        <b-button
          class="d-flex w-100 justify-content-between"
          :disabled="!(storyAiSuggestions.length || storyKindAiSuggestion)"
          @click="
            showAiDetectionsOn =
              showAiDetectionsOn === undefined ? entry.id : undefined
          "
        >
          <div>{{ $t("Détections AI") }}</div>
          <i-bi-chevron-down />
        </b-button>
      </b-col>
      <template v-if="showAiDetectionsOn">
        <b-col col cols="3" class="text-start white-space-normal">
          <div>
            {{
              $t("{numberOfPanels} cases trouvées", {
                numberOfPanels: pages[0].aiKumikoResultPanels.length,
              })
            }}
            <table-tooltip
              target="panels"
              :data="pages[0].aiKumikoResultPanels"
            />
            <i-bi-info-circle-fill id="panels" />
          </div>
          <div v-if="storyKindAiSuggestion">
            <i-bi-arrow-right />&nbsp;<AiSuggestionIcon status="success" />
            {{ getStoryKind(storyKindAiSuggestion.kind) }}
          </div>
        </b-col>
        <b-col col cols="3" class="text-start white-space-normal">
          <div v-if="pages[0].aiOcrResults.length">
            {{
              $t("{textNumber} textes trouvés", {
                textNumber: pages[0].aiOcrResults.length,
              })
            }}
            <table-tooltip target="texts" :data="pages[0].aiOcrResults" />
            <i-bi-info-circle-fill id="texts" />
            <div v-if="pages[0].aiOcrPossibleStories.length">
              <div>
                {{
                  $t(
                    "{numberOfStories} histoires trouvées avec ces mots-clés",
                    {
                      numberOfStories: pages[0].aiOcrPossibleStories.length,
                    },
                  )
                }}
                <table-tooltip
                  target="stories"
                  :data="pages[0].aiOcrPossibleStories"
                />
                <i-bi-info-circle-fill id="stories" />
              </div>
              <div
                v-for="possibleStory in pages[0].aiOcrPossibleStories"
                :key="
                  possibleStory.storySuggestions[0].storyversioncode ||
                  'unknown'
                "
              >
                <i-bi-arrow-right />&nbsp;<AiSuggestionIcon status="success" />
                <Story :story="possibleStory.storySuggestions[0]" />
              </div>
            </div>
            <div v-else>
              {{
                $t("{numberOfStories} histoires trouvées avec ces mots-clés", {
                  numberOfStories: 0,
                })
              }}
            </div>
          </div>
          <div v-else>
            {{
              $t("{textNumber} textes trouvés", {
                textNumber: 0,
              })
            }}
          </div></b-col
        ></template
      ></template
    >
    <template v-else>
      <b-col col cols="3">
        <b-badge
          size="xl"
          :class="{ [`kind-${entry.acceptedStoryKind?.kind}`]: true }"
          >{{
            (entry.acceptedStoryKind &&
              getStoryKind(entry.acceptedStoryKind.kind)) ||
            $t("Type inconnu")
          }}</b-badge
        ></b-col
      >
      <b-col cols="3">
        <template v-if="entry.acceptedStory">{{
          storyversionDetails[entry.acceptedStory.storyversioncode].storycode
        }}</template
        ><template v-else>{{ $t("Contenu inconnu") }}</template>
      </b-col>
      <b-col col cols="6"
        >{{ title || $t("Sans titre") }}
        <template v-if="entry.part">
          - {{ $t("partie") }} {{ entry.part }}</template
        >
        <br />
        <small>{{ entry.entrycomment }}</small>
        &nbsp;<a
          v-if="urlEncodedStorycode"
          target="_blank"
          :href="`https://inducks.org/story.php?c=${urlEncodedStorycode}`"
        >
          {{ $t("Détails de l'histoire") }}
        </a>
      </b-col></template
    >
  </b-row>
</template>
<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import { FullEntry, FullIndexation } from "~dumili-services/indexation/types";
import { storyKinds } from "~dumili-types/storyKinds";
import type { storyKind } from "~prisma/client_dumili";

const { t: $t } = useI18n();
const props = defineProps<{
  editable: boolean;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const entry = defineModel<FullEntry>({ required: true });

watch(
  () => entry.value.acceptedStoryKind,
  (storyKind) => {
    indexationSocket.value!.services.acceptStoryKindSuggestion(
      entry.value.id,
      storyKind?.id || null,
    );
  },
);

watch(
  () => [
    entry.value.entirepages,
    entry.value.brokenpagenumerator,
    entry.value.brokenpagedenominator,
  ],
  ([entirepages, brokenpagenumerator, brokenpagedenominator]) => {
    indexationSocket.value!.services.updateEntryLength(entry.value.id, {
      entirepages,
      brokenpagenumerator,
      brokenpagedenominator,
    });
  },
);

const { editable } = toRefs(props);

const { acceptedStories } = storeToRefs(suggestions());
const { storyversionDetails } = storeToRefs(coa());
const { showAiDetectionsOn } = storeToRefs(ui());

const pages: FullIndexation["pages"] = []; // TODO

const acceptedStory = computed(() => acceptedStories.value[entry.value.id]);

const storyKindAiSuggestion = computed(() =>
  entry.value.storyKindSuggestions.find(
    ({ aiSourcePageId }) => aiSourcePageId !== null,
  ),
);

const storyAiSuggestions = computed(() =>
  entry.value.storySuggestions.filter(({ ocrDetailsId }) => ocrDetailsId),
);

const storycode = computed(() => acceptedStory.value?.storyversion.storycode);
const title = computed(() => entry.value.title || $t("Sans titre"));

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value),
);

const getStoryKind = (storyKind: storyKind) =>
  storyKinds.find(({ code }) => code === storyKind)?.label;
</script>

<style scoped lang="scss">
@use "sass:color";

.col {
  display: flex;
  justify-content: center;
}

:deep(.dropdown-menu) {
  background: lightgrey;
  overflow-x: visible !important;
}
.badge,
:deep(.dropdown-item) {
  width: max(100%, max-content);
}

@mixin storyKindBackground($bg) {
  background-color: $bg;
  color: color.invert($bg);
  &.btn:hover {
    background-color: color.adjust($bg, $lightness: 10%);
  }
}

.badge,
:deep(.btn-group .btn),
:deep(.dropdown-item) {
  @include storyKindBackground(lightgrey);
  &.kind-c {
    @include storyKindBackground(#ffcc33);
  }

  &.kind-n {
    @include storyKindBackground(#cbdced);
  }

  &.kind-n_g {
    @include storyKindBackground(#ff99ff);
  }
}

.dark {
  color: black;
}
:deep(.tooltip.show) {
  opacity: 1 !important;
}

:deep(.tooltip-inner) {
  max-width: initial;
  white-space: nowrap;
}
</style>
