<template>
  <b-row
    class="d-flex w-100 align-items-start pt-1 sticky-top"
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
        {{ storyDetails[entry.acceptedStory!.storycode].title }}
        &nbsp;<inducks-link
          :url-encoded-storycode="urlEncodedStorycode" /></template
      ><template v-else>{{ $t("Contenu inconnu") }}</template>
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

const { t } = useI18n();
defineProps<{
  editable: boolean;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;

const { storyDetails } = storeToRefs(coa());

const entry = defineModel<FullEntry>({ required: true });

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
