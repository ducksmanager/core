<template>
  <b-row
    class="d-flex w-100 align-items-center sticky-top"
    :style="
      entry.entirepages > 0
        ? { height: `${entry.entirepages * 50}px` }
        : undefined
    "
  >
    <b-col
      col
      cols="3"
      class="position-relative d-flex flex-column justify-content-center align-items-center h-100"
    >
      <EntryStoryKindTooltip :entry="entry" />
      <template v-if="editable">
        <suggestion-list
          v-model="entry.acceptedStoryKind"
          :suggestions="entry.storyKindSuggestions"
          :is-ai-source="({ ai }) => ai !== null"
          :item-class="(suggestion) => [`kind-${suggestion.kind}`]"
        >
          <template #default="{ suggestion, isDropdownItem }">
            {{ storyKinds[suggestion.kind] }}
            <span
              v-if="
                !isDropdownItem &&
                getEntryPages(indexation, entry.id)[0].pageNumber === 1 &&
                entry.acceptedStoryKind?.kind !== COVER
              "
              class="d-flex ms-1"
              :title="
                $t('La première page est généralement une page de couverture')
              "
            >
              <i-bi-exclamation-triangle-fill
            /></span>
            <span
              v-if="
                !isDropdownItem &&
                getEntryPages(indexation, entry.id).length > 1 &&
                entry.acceptedStoryKind?.kind === COVER
              "
              class="d-flex ms-1"
              :title="$t('La couverture ne devrait faire qu\'une page')"
            >
              <i-bi-exclamation-triangle-fill
            /></span>
          </template>
          <template #unknown-text>{{
            $t("Type inconnu")
          }}</template></suggestion-list
        ></template
      ><story-kind-badge
        v-else
        :story-kind="entry.acceptedStoryKind?.kind" /></b-col
    ><b-col
      col
      cols="4"
      class="position-relative d-flex flex-column align-items-center justify-content-center h-100"
    >
      <StorySuggestionList v-if="editable" v-model="entry" />
      <template v-else>
        <a
          v-if="urlEncodedStorycode"
          target="_blank"
          :href="`https://inducks.org/story.php?c=${urlEncodedStorycode}`"
          >{{ entry.acceptedStory!.storycode }}</a
        ><template v-else>{{ $t("Contenu inconnu") }}</template>
      </template>
      <StorySuggestionsTooltip :entry="entry" />
    </b-col>
    <b-col
      col
      cols="4"
      class="position-relative d-flex flex-column align-items-center justify-content-center h-100"
    >
      <b-form-textarea
        v-if="editable"
        :model-value="entry.title"
        :placeholder="$t('Titre de l\'histoire')"
        type="text"
        class="w-100 text-center bg-transparent text-black"
        @update:model-value="entry.title = ($event as string).replace(/[\r\n]+/g, '')"
      /><template v-else>
        {{ title || $t("Sans titre") }}
        <template v-if="entry.part"
          >{{ " - " }}{{ $t("partie") }} {{ entry.part }}</template
        >
        <br />
        <small>{{ entry.entrycomment }}</small>
      </template></b-col
    >
    <b-col
      col
      cols="1"
      class="position-relative d-flex flex-column align-items-center justify-content-center h-100"
      ><b-modal
        v-model="showDeleteEntryModal"
        :title="$t('Confirmation')"
        footer-class="d-flex justify-content-between"
      >
        {{ $t("Voulez-vous vraiment supprimer cette entrée ?") }}
        <template #footer
          ><b-button v-if="!isFirst" @click="deleteEntry('previous')">{{
            $t("Oui, étendre l'entrée précédente à ces pages")
          }}</b-button
          ><b-button v-if="!isLast" @click="deleteEntry('next')">{{
            $t("Oui, étendre l'entrée suivante à ces pages")
          }}</b-button
          ><b-button @click="showDeleteEntryModal = false">{{
            $t("Non, annuler la suppression")
          }}</b-button></template
        >
      </b-modal>
      <b-button
        v-if="!(isFirst && isLast)"
        variant="danger"
        class="d-flex justify-content-center"
        @click.stop="showDeleteEntryModal = true"
        ><i-bi-trash3 /></b-button
    ></b-col>
  </b-row>
</template>
<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import type {
  FullEntry,
  FullIndexation,
} from "~dumili-services/indexation/types";
import { COVER, storyKinds } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";

const { t } = useI18n();
defineProps<{
  editable: boolean;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const { loadIndexation } = suggestions();

const entry = defineModel<FullEntry>({ required: true });

const showDeleteEntryModal = ref(false);

const isFirst = computed(
  () => entry.value.id === indexation.value.entries[0].id,
);

const isLast = computed(
  () => entry.value.id === [...indexation.value.entries].pop()!.id,
);

const deleteEntry = async (entryIdToExtend: "previous" | "next") => {
  await indexationSocket.value!.services.deleteEntry(
    entry.value.id,
    entryIdToExtend,
  );
  await loadIndexation();
};

watch(
  () => entry.value.acceptedStoryKind?.id,
  (storyKindId) => {
    indexationSocket.value!.services.acceptStoryKindSuggestion(
      entry.value.id,
      storyKindId || null,
    );
  },
);

watchDebounced(
  () =>
    JSON.stringify([
      entry.value.entirepages,
      entry.value.brokenpagenumerator,
      entry.value.brokenpagedenominator,
      entry.value.title,
    ]),
  async () => {
    const { entirepages, brokenpagenumerator, brokenpagedenominator, title } =
      entry.value;
    await indexationSocket.value!.services.updateEntry(entry.value.id, {
      entirepages,
      brokenpagenumerator,
      brokenpagedenominator,
      title,
    });
    await loadIndexation();
  },
  { debounce: 500, maxWait: 1000 },
);

const storycode = computed(() => entry.value.acceptedStory?.storycode);
const title = computed(() => entry.value.title || t("Sans titre"));

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value),
);
</script>

<style scoped lang="scss">
@use "sass:color";

.row .col {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  &:last-child {
    border-right: none;
  }
}

:deep(.dropdown-menu) {
  background: lightgrey;
  overflow-x: visible !important;

  [role="group"] {
    color: black;
    font-weight: bold;
    font-style: italic;
  }
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
  color: black;

  &:hover {
    background: #ddd;
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
