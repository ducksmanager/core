<template>
  <span>
    <template v-if="editable">
      <b-dropdown
        :text="storyversionKindText"
        :toggle-class="{ [`kind-${kind}`]: true }"
        ><b-dropdown-item
          v-for="storyversionKind of storyversionKinds"
          :key="storyversionKind.value"
          :class="{ [`kind-${storyversionKind.value}`]: true }"
          @click="acceptStoryversionKindSuggestion(storyversionKind.value)"
          >{{ storyversionKind.text }}</b-dropdown-item
        ><template #button-content>
          <div v-if="storyversionKindText" class="d-flex">
            {{ storyversionKindText }}
          </div>
          <template v-else>Type inconnu</template></template
        ></b-dropdown
      ><EntrySuggestionList :entryurl="entryurl"
    /></template>
    <template v-else>
      <b-badge size="xl" :class="{ [`kind-${kind}`]: true }">{{
        storyversionKindText || "Type inconnu"
      }}</b-badge>
      {{ title || $t("Sans titre") }}</template
    >
    <template v-if="part"> - {{ $t("partie") }} {{ part }}</template>
    <small>{{ comment }}</small>
    &nbsp;<a
      v-if="urlEncodedStorycode"
      target="_blank"
      :href="`https://coa.inducks.org/story.php?c=${urlEncodedStorycode}`"
    >
      {{ $t("Détails de l'histoire") }}
    </a>
  </span>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { StoryversionKind, SuggestedEntry } from "~/stores/issueDetails";
import { issueDetails } from "~/stores/issueDetails";

const { t: $t } = useI18n();
const props = defineProps<{
  entryurl: string;
  editable: boolean;
}>();

const issueDetailsStore = issueDetails();

const acceptedEntry = computed(
  () => issueDetailsStore.acceptedEntries[props.entryurl]
);

const storyversion = computed(() => acceptedEntry.value?.storyversion);
const storycode = computed(() => storyversion.value?.storycode);
const kind = computed(() => storyversion.value?.kind || "?");
const part = computed(() => acceptedEntry.value.part);
const title = computed(() => acceptedEntry.value.title || $t("Sans titre"));
const comment = computed(() => acceptedEntry.value?.entrycomment);

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value)
);

const storyversionKindText = computed(() =>
  kind.value && storyversionKinds.value
    ? storyversionKinds.value.find(({ value }) => value === kind.value)?.text
    : ""
);
const storyversionKinds = computed(() =>
  Object.keys(StoryversionKind)
    .map((key) => ({
      value: getStoryversionKind(key as StoryversionKind),
      text: key as StoryversionKind,
    }))
    .sort((a, b) => a.text.localeCompare(b.text))
);

const getStoryversionKind = (storyversionKind: StoryversionKind) =>
  Object.values(StoryversionKind)[
    Object.keys(StoryversionKind).indexOf(storyversionKind)
  ];

const acceptStoryversionKindSuggestion = (storyversionKind: string) => {
  const [
    entrySuggestionsWithoutStoryversionKind,
    entrySuggestionsWithStoryversionKind,
  ] = issueDetailsStore.entrySuggestions[props.entryurl].reduce(
    (acc, entrySuggestion) => {
      if (!entrySuggestion.storyversion) {
        return acc;
      }
      const key =
        entrySuggestion.storyversion?.kind === storyversionKind ? 1 : 0;
      acc[key]?.push(entrySuggestion);
      return acc;
    },
    [[], []] as [SuggestedEntry[], SuggestedEntry[]]
  );
  issueDetailsStore.rejectAllEntrySuggestions(props.entryurl);
  debugger;
  if (entrySuggestionsWithStoryversionKind.length) {
    issueDetailsStore.acceptEntrySuggestion(
      props.entryurl,
      entrySuggestionsWithStoryversionKind[0].entrycode
    );
  } else {
    issueDetailsStore.entrySuggestions[props.entryurl] = [
      ...entrySuggestionsWithoutStoryversionKind,
      {
        storyversion: {
          kind: storyversionKind as StoryversionKind,
          storycode: storycode.value,
        },
        type: "ongoing",
        isAccepted: true,
      },
    ];
  }
};
</script>

<style scoped lang="scss">
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
