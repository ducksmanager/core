<template>
  <b-form-group>
    <b-form-group class="mb-3" :label="$t('Type d\'histoire')">
      <story-kind-suggestion-list
        v-model="entry.acceptedStoryKind"
        v-bind="{ entry: entry, editable: true }"
      />
    </b-form-group>
    <b-form-group class="mb-3" :label="$t('Histoire')">
      <div class="position-relative">
        <StorySuggestionList v-model="entry" />
        <StorySuggestionsTooltip v-if="!entry.includedInEntry" :entry="entry" />
      </div>
    </b-form-group>
    <b-form-group class="mb-3 title" :label="$t('Titre')">
      <suggestion-list
        class="w-100"
        text-editable
        :model-value="{ id: entry.title || '', category: 'user' as const }"
        :category="({ category }) => category"
        :show-tooltips="false"
        :suggestions="[
          ...previousTitles.map((title) => ({
            id: title,
            category: 'previous' as const,
          })),
          ...(previousTitles.length
            ? []
            : [
                {
                  id: $t('No previous title in this language'),
                  category: 'previous' as const,
                  isDisabled: true,
                },
              ]),
          { id: entry.title || '', category: 'user' as const },
        ]"
        @update:model-value="entry.title = $event!.id"
      >
        <template #default="{ suggestion, location }">
          <input
            v-if="location === 'button'"
            v-model="entry.title"
            type="text"
            class="form-control bg-transparent"
          />
          <template v-else>
            {{ suggestion.id || "&nbsp;" }}
          </template></template
        >
      </suggestion-list>
    </b-form-group>
  </b-form-group>
  <b-form-group v-if="allowIncludedEntries">
    <b-form-checkbox v-model="showIncludesOtherEntriesSection">{{
      $t("Cette entrée inclut d'autres entrées")
    }}</b-form-checkbox>
    <div v-if="showIncludesOtherEntriesSection" class="ms-5">
      <b-row
        v-for="includedEntryIndex of Object.keys(entry.includedEntries!).map(
          Number,
        )"
        :key="includedEntryIndex"
        class="flex-wrap align-items-center"
        ><b-col cols="11"
          ><b-form-group class="my-3 p-3 border border-secondary rounded"
            ><entry-edit-form-group
              v-model="
                entry.includedEntries![includedEntryIndex]
              " /></b-form-group
        ></b-col>
        <b-col>
          <delete-entry-modal
            :show="showDeleteEntryModal"
            @confirm="
              deleteEntry(entry.includedEntries![includedEntryIndex].id)
            " /><b-button
            variant="danger"
            class="d-flex justify-content-center"
            @click.stop="showDeleteEntryModal = true"
            ><i-bi-trash3 /></b-button
        ></b-col>
      </b-row>
      <div class="d-flex justify-content-center align-items-center">
        <b-button
          class="fw-bold mx-md-n5 d-flex justify-content-center align-items-center"
          variant="success"
          @click="createEntry()"
          >{{ $t("Ajouter une entrée") }}</b-button
        >
      </div>
    </div>
  </b-form-group>
</template>
<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

const entry = defineModel<FullEntry>({ required: true });
const { allowIncludedEntries = false } = defineProps<{
  allowIncludedEntries?: boolean;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const { languagecode } = storeToRefs(suggestions());
const { deleteEntry } = suggestions();

const showDeleteEntryModal = ref(false);

const previousTitles = ref<string[]>([]);
const showIncludesOtherEntriesSection = ref(
  !!entry.value.includedEntries?.length,
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

const createEntry = () =>
  indexationSocket.value!.createEntry(entry.value.position, entry.value.id);
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

.title :deep(.dropdown-toggle) {
  padding: 0 !important;
}
</style>
