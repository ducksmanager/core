<template>
  <b-row class="d-flex w-100 align-items-center">
    <template v-if="editable">
      <b-col cols="3">
        <suggestion-list
          :suggestions="storyversionKinds"
          :show-customize-form="false"
          :allow-customize-form="false"
          :get-current="() => acceptedStoryversionKind"
          :item-class="(suggestion: StoryversionKindSuggestion) => ( [`kind-${suggestion.data?.kind}`])"
          @select="
            acceptStoryversionKindSuggestion($event?.data?.kind as string)
          "
        >
          <template #item="suggestion: StoryversionKindSuggestion">
            {{ getStoryversionKind(suggestion) }}
          </template>
          <template #unknown>{{ $t("Type inconnu") }}</template>
        </suggestion-list> </b-col
      ><b-col cols="3"><StorySuggestionList :entryurl="entryurl" /></b-col>
      <b-col cols="3">
        <b-form-input
          type="text"
          class="w-100"
          :value="acceptedEntry?.data.title || ''" /></b-col
      ><b-col cols="3">
        <b-button
          class="d-flex w-100 space-between"
          :disabled="!aiDetails[entryurl]"
          @click="
            showAiDetections =
              showAiDetections === undefined ? entryurl : undefined
          "
        >
          <div>{{ $t("Détections AI") }}</div>
          <i-bi-chevron-down />
        </b-button>
      </b-col>
      <template v-if="showAiDetections">
        <b-col cols="3" class="text-start white-space-normal">
          <div>
            {{
              $t("{panelNumber} cases trouvées", {
                panelNumber: aiDetails[entryurl].panels.length,
              })
            }}
            <i-bi-info-circle-fill
              v-b-tooltip="JSON.stringify(aiDetails[entryurl].panels)"
            />
          </div>
          <div>
            <i-bi-arrow-right />&nbsp;<AiSuggestionIcon status="success" />
            {{
              getStoryversionKind(
                storyversionKinds.find(({ meta }) => meta.source === "ai")
              )
            }}
          </div>
        </b-col>
        <b-col cols="3" class="text-start white-space-normal">
          <div>
            {{
              $t("{textNumber} textes trouvés", {
                textNumber: aiDetails[entryurl].texts.ocrResults.length,
              })
            }}
            <i-bi-info-circle-fill
              v-b-tooltip="JSON.stringify(aiDetails[entryurl].texts.ocrResults)"
            />
          </div>
          <template v-if="aiDetails[entryurl].texts.ocrResults.length"
            ><div>
              {{
                $t("{storyNumber} histoires trouvées avec ces mots-clés", {
                  storyNumber: aiDetails[entryurl].texts.possibleStories.length,
                })
              }}
              <i-bi-info-circle-fill
                v-b-tooltip="
                  JSON.stringify(aiDetails[entryurl].texts.possibleStories)
                "
              />
            </div>
            <div
              v-for="possibleStory in aiDetails[entryurl].texts.possibleStories"
              :key="possibleStory.storyversion!.storycode || 'unknown'"
            >
              <i-bi-arrow-right />&nbsp;<AiSuggestionIcon status="success" />
              <Story
                :entry="possibleStory"
              /></div></template></b-col></template
    ></template>
    <template v-else>
      <b-col cols="3">
        <b-badge
          size="xl"
          :class="{ [`kind-${acceptedStoryversionKind?.data?.kind}`]: true }"
          >{{
            getStoryversionKind(acceptedStoryversionKind) || $t("Type inconnu")
          }}</b-badge
        ></b-col
      >
      <b-col cols="3">
        <template v-if="acceptedEntry?.data.storyversion?.storycode">{{
          acceptedEntry?.data.storyversion?.storycode
        }}</template
        ><template v-else>{{ $t("Contenu inconnu") }}</template>
      </b-col>
      <b-col cols="3"
        >{{ title || $t("Sans titre") }}
        <template v-if="part"> - {{ $t("partie") }} {{ part }}</template></b-col
      ><b-col cols="3">
        <small>{{ comment }}</small>
        &nbsp;<a
          v-if="urlEncodedStorycode"
          target="_blank"
          :href="`https://coa.inducks.org/story.php?c=${urlEncodedStorycode}`"
        >
          {{ $t("Détails de l'histoire") }}
        </a>
      </b-col></template
    >
  </b-row>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ai as aiStore } from "~/stores/ai";
import {
  StoryversionKind,
  StoryversionKindSuggestion,
} from "~/stores/suggestions";
import { suggestions } from "~/stores/suggestions";
import { user } from "~/stores/user";

const { t: $t } = useI18n();
const props = defineProps<{
  entryurl: string;
  editable: boolean;
}>();

defineEmits<{
  (params: { toggle: boolean; type: "storyversionKind" }): void;
}>();

const suggestionsStore = suggestions();

const showAiDetections = storeToRefs(user()).showAiDetectionsOn;
const aiDetails = storeToRefs(aiStore()).aiDetails;

const acceptedEntry = computed(
  () => suggestionsStore.acceptedEntries[props.entryurl]
);

const acceptedStoryversionKind = computed(
  () => suggestionsStore.acceptedStoryversionKinds[props.entryurl]
);

const storyversion = computed(() => acceptedEntry.value?.data.storyversion);
const storycode = computed(() => storyversion.value?.storycode);
const part = computed(() => acceptedEntry.value?.data.part);
const title = computed(
  () => acceptedEntry.value?.data.title || $t("Sans titre")
);
const comment = computed(() => acceptedEntry.value?.data.entrycomment);

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value)
);

const storyversionKinds = computed(
  () => suggestionsStore.storyversionKindSuggestions[props.entryurl]
);

const getStoryversionKind = (
  storyversionKind: StoryversionKindSuggestion | undefined
) =>
  !storyversionKind
    ? $t("Type inconnu")
    : Object.keys(StoryversionKind)[
        Object.values(StoryversionKind).indexOf(storyversionKind.data.kind)
      ];

const acceptStoryversionKindSuggestion = (storyversionKind: string) => {
  suggestionsStore.acceptSuggestion(
    suggestionsStore.storyversionKindSuggestions[props.entryurl],
    (suggestion: StoryversionKindSuggestion) =>
      suggestion.data.kind === storyversionKind
  );
};
</script>

<style scoped lang="scss">
.col {
  text-align: left;
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
  background-color: $bg !important;
  color: invert($bg);
  &:hover {
    background-color: lighten($bg, 10%) !important;
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
</style>
