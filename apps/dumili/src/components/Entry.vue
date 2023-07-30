<template>
  <b-row class="d-flex w-100 align-items-center">
    <template v-if="editable">
      <b-col>
        <b-dropdown
          :text="acceptedStoryversionKindText"
          :toggle-class="{ [`kind-${kind}`]: true }"
          ><b-dropdown-item
            v-for="storyversionKind of storyversionKinds"
            :key="storyversionKind.value"
            class="d-flex justify-content-between"
            :class="{ [`kind-${storyversionKind.value}`]: true }"
            @click="acceptStoryversionKindSuggestion(storyversionKind.value)"
            >{{ storyversionKind.text
            }}<AiSuggestionIcon
              v-if="
                entryStorySuggestions.some(
                  ({ storyversion, type }) =>
                    storyversion?.kind === storyversionKind.value &&
                    type === 'ai'
                )
              " /></b-dropdown-item
          ><template #button-content>
            <div v-if="acceptedStoryversionKindText" class="d-flex">
              {{ acceptedStoryversionKindText }}
              <AiSuggestionIcon v-if="acceptedEntry?.type === 'ai'" />
            </div>
            <template v-else>Type inconnu</template></template
          ></b-dropdown
        ></b-col
      ><b-col><StorySuggestionList :entryurl="entryurl" /></b-col>
      <b-col>
        <input
          type="text"
          class="w-100"
          :value="acceptedEntry?.title || ''" /></b-col
    ></template>
    <template v-else>
      <b-col>
        <b-badge size="xl" :class="{ [`kind-${kind}`]: true }">{{
          acceptedStoryversionKindText || "Type inconnu"
        }}</b-badge></b-col
      >
      <b-col>
        <template v-if="acceptedEntry?.storyversion?.storycode">{{
          acceptedEntry?.storyversion?.storycode
        }}</template
        ><template v-else>{{ $t("Contenu inconnu") }}</template>
      </b-col>
      <b-col
        >{{ title || $t("Sans titre") }}
        <template v-if="part"> - {{ $t("partie") }} {{ part }}</template></b-col
      ></template
    >
    <b-col class="text-center">
      <small>{{ comment }}</small>
      &nbsp;<a
        v-if="urlEncodedStorycode"
        target="_blank"
        :href="`https://coa.inducks.org/story.php?c=${urlEncodedStorycode}`"
      >
        {{ $t("Détails de l'histoire") }}
      </a></b-col
    >
  </b-row>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { EntrySuggestion, StoryversionKind } from "~/stores/issueDetails";
import { issueDetails } from "~/stores/issueDetails";

const { t: $t } = useI18n();
const props = defineProps<{
  entryurl: string;
  editable: boolean;
}>();

const issueDetailsStore = issueDetails();

const entryStorySuggestions = computed(
  () => issueDetailsStore.entrySuggestions[props.entryurl]
);

const acceptedEntry = computed(
  () => issueDetailsStore.acceptedEntries[props.entryurl]
);

const storyversion = computed(() => acceptedEntry.value?.storyversion);
const storycode = computed(() => storyversion.value?.storycode);
const kind = computed(() => storyversion.value?.kind || "?");
const part = computed(() => acceptedEntry.value?.part);
const title = computed(() => acceptedEntry.value?.title || $t("Sans titre"));
const comment = computed(() => acceptedEntry.value?.entrycomment);

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value)
);

const acceptedStoryversionKindText = computed(() =>
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
    // entrySuggestionsWithoutStoryversionKind,
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
    [[], []] as [EntrySuggestion[], EntrySuggestion[]]
  );
  issueDetailsStore.rejectAllEntrySuggestions(props.entryurl);
  if (entrySuggestionsWithStoryversionKind.length) {
    issueDetailsStore.acceptEntrySuggestion(
      props.entryurl,
      entrySuggestionsWithStoryversionKind[0].entrycode
    );
  }
  // } else {
  //   issueDetailsStore.entrySuggestions[props.entryurl] = [
  //     ...entrySuggestionsWithoutStoryversionKind,
  //     {
  //       storyversion: {
  //         kind: storyversionKind as StoryversionKind,
  //         storycode: storycode.value,
  //       },
  //       isAccepted: true,
  //     },
  //   ];
  // }
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
