<template>
  <b-modal v-model="show" :title="$t('Détails de l\'entrée')" lazy no-footer>
    <b-form @submit.prevent>
      <entry-edit-form-group v-model="draft" allow-included-entries />
    </b-form>
  </b-modal>
</template>
<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const entry = defineModel<FullEntry>({
  required: true,
});
const show = defineModel<boolean>("show", { required: true });

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const { languagecode } = storeToRefs(suggestions());

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const cloneEntry = () => JSON.parse(JSON.stringify(entry.value)) as FullEntry;

const draft = ref<FullEntry>(cloneEntry());

const draftUpdates = computed(() =>
  [draft.value, ...(draft.value.includedEntries ?? [])].map(
    ({
      acceptedStory,
      acceptedStoryKind,
      entirepages,
      id,
      position,
      storySuggestions,
      title,
    }) => ({
      acceptedStory,
      acceptedStoryKind,
      entirepages,
      id,
      position,
      storySuggestions,
      title,
    }),
  ),
);

watch(show, (isOpen) => {
  if (isOpen) {
    draft.value = cloneEntry();
  }
});

const previousTitles = ref<string[]>([]);

watch(
  () => draft.value.acceptedStory?.storycode,
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

watchDebounced(
  draftUpdates,
  async (entryUpdates, oldEntryUpdates) => {
    if (JSON.stringify(entryUpdates) === JSON.stringify(oldEntryUpdates)) {
      return;
    }
    const socket = indexationSocket.value!;
    for (const {
      acceptedStory,
      acceptedStoryKind,
      entirepages,
      id,
      position,
      storySuggestions,
      title,
    } of entryUpdates) {
      await socket.acceptStoryKindSuggestion(id, acceptedStoryKind?.id ?? null);

      let storySuggestionId: number | null = null;
      if (acceptedStory) {
        storySuggestionId =
          storySuggestions.find((s) => s.storycode === acceptedStory.storycode)
            ?.id ?? null;
        if (storySuggestionId === null) {
          const { createdStorySuggestion } = await socket.createStorySuggestion(
            {
              entryId: id,
              storycode: acceptedStory.storycode,
            },
          );
          storySuggestionId = createdStorySuggestion.id;
        }
      }
      await socket.acceptStorySuggestion(id, storySuggestionId);

      await socket.updateEntry(id, {
        entirepages,
        position,
        title,
      });
    }
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
textarea {
  background: rgb(222, 222, 222) !important;
}

:deep(.tooltip.show) {
  opacity: 1 !important;
}

:deep(.tooltip-inner) {
  max-width: initial;
  white-space: nowrap;
}
</style>
