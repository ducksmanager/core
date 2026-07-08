<template>
  <b-row
    class="d-flex w-100 align-items-center"
    :style="
      entry.entirepages > 0
        ? { height: `${entry.entirepages * 50}px` }
        : undefined
    "
    @dblclick.stop="showEditModal = true"
  >
    <b-col
      col
      cols="3"
      class="position-relative d-flex flex-column justify-content-center align-items-center h-100"
    >
      <story-kind-badge
        :kind="entry.acceptedStoryKind?.storyKindRows.kind"
        :included-entry-kinds="
          (entry.includedEntries ?? []).map(
            ({ acceptedStoryKind: includedAcceptedStoryKind }) =>
              includedAcceptedStoryKind?.storyKindRows.kind,
          )
        " /></b-col
    ><b-col
      col
      cols="4"
      class="d-flex flex-column align-items-center justify-content-center position-relative h-100 text-normal"
    >
      <template v-if="urlEncodedStorycode">
        {{
          storyDetails[entry.acceptedStory!.storycode].title ||
          $t("(Sans titre)")
        }}
        &nbsp;<inducks-link
          :storycode="entry.acceptedStory!.storycode" /></template
      ><template v-else>{{ $t("Contenu inconnu") }}</template>
    </b-col>
    <b-col
      col
      cols="4"
      class="position-relative d-flex flex-column align-items-center justify-content-center h-100"
    >
      {{ title || $t("(Sans titre)") }}
      <template v-if="entry.part">
        &nbsp;-&nbsp;{{ $t("partie") }} {{ entry.part }}</template
      >
      <br />
      <small>{{ entry.entrycomment }}</small></b-col
    >
    <b-col
      col
      cols="1"
      class="position-relative d-flex flex-column align-items-center justify-content-center h-100"
      ><delete-entry-modal
        v-model:show="showDeleteEntryModal"
        @confirm="deleteEntry(entry.id)" />
      <b-button
        variant="primary"
        class="d-flex justify-content-center mb-1"
        @click.stop="showEditModal = true"
        ><i-bi-pencil
      /></b-button>
      <b-button
        v-if="!(isFirst && isLast)"
        variant="danger"
        class="d-flex justify-content-center"
        @click.stop="showDeleteEntryModal = true"
        ><i-bi-trash3 /></b-button
    ></b-col>
  </b-row>
  <entry-edit-modal v-model="entry" v-model:show="showEditModal" />
</template>
<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";

const { t } = useI18n();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const { deleteEntry } = suggestions();

const { storyDetails } = storeToRefs(coa());

const entry = defineModel<FullEntry>({
  required: true,
});

if (
  entry.value.acceptedStory &&
  !storyDetails.value[entry.value.acceptedStory!.storycode]
) {
  console.error("No story details for", entry.value.acceptedStory!.storycode);
}

const showDeleteEntryModal = ref(false);

const showEditModal = ref(false);

const isFirst = computed(
  () => entry.value.id === indexation.value.entries[0].id,
);

const isLast = computed(
  () => entry.value.id === [...indexation.value.entries].pop()!.id,
);

watchDebounced(
  () => JSON.stringify([entry.value.position, entry.value.entirepages]),
  async () => {
    const { entirepages, id, position, title } = entry.value;
    await indexationSocket.value!.updateEntry(id, {
      position,
      entirepages,
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
</script>

<style scoped lang="scss">
@use "sass:color";

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
</style>
