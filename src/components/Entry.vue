<template>
  <b-row class="d-flex w-100 align-items-center">
    <template v-if="editable">
      <b-col>
        <suggestion-list
          :suggestions="storyversionKinds"
          :show-customize-form="false"
          :allow-customize-form="false"
          :get-current="() => acceptedStoryversionKind"
          :item-class="(suggestion: StoryversionKindSuggestion) => ({ [`kind-${suggestion.data?.kind}`]: true })"
          @ai-item-mouseover="
            $emit('toggle-ai-details', {
              toggle: true,
              type: 'storyversionKind',
            })
          "
          @ai-item-mouseout="
            $emit('toggle-ai-details', {
              toggle: false,
              type: 'storyversionKind',
            })
          "
          @select="
            acceptStoryversionKindSuggestion($event?.data?.kind as string)
          "
        >
          <template #item="suggestion: StoryversionKindSuggestion">
            {{ getStoryversionKind(suggestion) }}
          </template>
          <template #unknown>{{ $t("Type inconnu") }}</template>
        </suggestion-list> </b-col
      ><b-col><StorySuggestionList :entryurl="entryurl" /></b-col>
      <b-col>
        <input
          type="text"
          class="w-100"
          :value="acceptedEntry?.data.title || ''" /></b-col
    ></template>
    <template v-else>
      <b-col>
        <b-badge
          size="xl"
          :class="{ [`kind-${acceptedStoryversionKind?.data?.kind}`]: true }"
          >{{
            getStoryversionKind(acceptedStoryversionKind) || $t("Type inconnu")
          }}</b-badge
        ></b-col
      >
      <b-col>
        <template v-if="acceptedEntry?.data.storyversion?.storycode">{{
          acceptedEntry?.data.storyversion?.storycode
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

import {
  StoryversionKind,
  StoryversionKindSuggestion,
} from "~/stores/suggestions";
import { suggestions } from "~/stores/suggestions";

const { t: $t } = useI18n();
const props = defineProps<{
  entryurl: string;
  editable: boolean;
}>();

defineEmits<{
  (
    e: "toggle-ai-details",
    params: { toggle: boolean; type: "storyversionKind" }
  ): void;
}>();

const suggestionsStore = suggestions();

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
