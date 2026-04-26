<template>
  <b-row
    class="d-flex w-100 align-items-start sticky-top"
    :class="{ 'opacity-50': !editable }"
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
      <story-kind-suggestion-list
        v-model="entry.acceptedStoryKind"
        v-bind="{ entry, editable }"
      /> </b-col
    ><b-col
      col
      cols="4"
      class="d-flex flex-column align-items-center justify-content-center position-relative h-100 text-normal"
    >
      <StorySuggestionList v-if="editable" v-model="entry" />
      <template v-else-if="urlEncodedStorycode">
        {{ storyDetails[entry.acceptedStory!.storycode].title || $t("(Sans titre)") }}
        &nbsp;<inducks-link
          :storycode="entry.acceptedStory!.storycode" /></template
      ><template v-else>{{ $t("Contenu inconnu") }}</template>
      <StorySuggestionsTooltip :entry="entry" />
    </b-col>
    <b-col
      col
      cols="4"
      class="position-relative d-flex flex-column align-items-center justify-content-center h-100"
    >
      <suggestion-list
        v-if="editable"
        class="w-100"
        text-editable
        :model-value="{ id: entry.title || '', category: 'user' as const }"
        :category="({ category }) => category"
        :suggestions="[
          ...previousTitles.map((title) => ({
            id: title,
            category: 'previous' as const,
          })),
          { id: '&nbsp;', category: 'user' as const },
        ]"
        @update:model-value="entry.title = $event!.id"
      >
        <template #default="{ suggestion }">
          {{ suggestion.id || "&nbsp;" }}
        </template>
      </suggestion-list>
      <template v-else>
        {{ title || $t("(Sans titre)") }}
        <template v-if="entry.part">
          &nbsp;-&nbsp;{{ $t("partie") }} {{ entry.part }}</template
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
          ><b-button @click="deleteEntry()">{{
            $t("Oui, supprimer l'entrée")
          }}</b-button>
          <b-button @click="showDeleteEntryModal = false">{{
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
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { t } = useI18n();
defineProps<{
  editable: boolean;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const { languagecode } = storeToRefs(suggestions());

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const { storyDetails } = storeToRefs(coa());

const previousTitles = ref<string[]>([]);
const entry = defineModel<FullEntry>({ required: true });

if (
  entry.value.acceptedStory &&
  !storyDetails.value[entry.value.acceptedStory!.storycode]
) {
  console.error("No story details for", entry.value.acceptedStory!.storycode);
}

const showDeleteEntryModal = ref(false);

const isFirst = computed(
  () => entry.value.id === indexation.value.entries[0].id,
);

const isLast = computed(
  () => entry.value.id === [...indexation.value.entries].pop()!.id,
);

const deleteEntry = async () => {
  await indexationSocket.value!.deleteEntry(entry.value.id);
};

watch(
  () => entry.value.acceptedStoryKind?.id,
  (storyKindId) => {
    indexationSocket.value!.acceptStoryKindSuggestion(
      entry.value.id,
      storyKindId || null,
    );
  },
);

watchDebounced(
  () =>
    JSON.stringify([
      entry.value.position,
      entry.value.entirepages,
      entry.value.brokenpagenumerator,
      entry.value.brokenpagedenominator,
      entry.value.title,
    ]),
  async () => {
    const {
      position,
      entirepages,
      brokenpagenumerator,
      brokenpagedenominator,
      title,
    } = entry.value;
    await indexationSocket.value!.updateEntry(entry.value.id, {
      position,
      entirepages,
      brokenpagenumerator,
      brokenpagedenominator,
      title,
    });
  },
  { debounce: 500, maxWait: 1000 },
);

const storycode = computed(() => entry.value.acceptedStory?.storycode);
const title = computed(() => entry.value.title || t("(Sans titre)"));

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value),
);

watch(
  () => entry.value.acceptedStory?.storycode,
  async (storycode) => {
    if (storycode && languagecode.value) {
      previousTitles.value = await coaEvents.getStoryPreviousTitles(
        storycode,
        languagecode.value,
      );
    }
  },
  { immediate: true },
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

textarea {
  background: rgb(222, 222, 222) !important;
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
