<template>
  <b-card
    no-body
    class="table-of-contents d-flex w-100 h-100 m-0 p-0"
    body-class="flex-grow-1 w-100 h-100"
    header-class="position-relative p-0"
  >
    <template #header>
      <IssueSuggestionModal />
      <IssueSuggestionList />
      <b-dropdown
        :auto-close="false"
        variant="light"
        class="position-absolute h-100 end-0 d-flex"
        style="z-index: 1030"
      >
        <template #button-content>{{ $t("Méta-données") }}</template>
        <b-form @submit.prevent="updateIndexation">
          <b-alert
            v-if="indexation.acceptedIssueSuggestion === null"
            variant="warning"
            :model-value="true"
            style="white-space: pre"
            >{{
              $t(
                "Vous devez indiquer les caractéristiques du numéro\navant de pouvoir modifier certaines de ses méta-données.",
              )
            }}</b-alert
          >
          <b-dropdown-item
            >{{ $t("Date de publication") }}
            <input
              :value="(indexationEdit.releaseDate as unknown as string)?.split('T')[0]"
              type="date"
              v-bind="getInputProps()"
              @input="
                if ($event.target) {
                  indexationEdit.releaseDate = (($event.target as HTMLInputElement).value);
                }
              "
              @click.stop="() => {}"
          /></b-dropdown-item>
          <b-dropdown-item
            >{{ $t("Prix") }}
            <input
              v-model="indexationEdit.price"
              type="text"
              v-bind="getInputProps()"
              @click.stop="() => {}"
          /></b-dropdown-item>
          <b-dropdown-item
            >{{ $t("Nombre de pages") }}
            <input
              v-model.number="indexationEdit.numberOfPages"
              type="number"
              min="4"
              max="996"
              step="2"
              @click.stop="() => {}"
          /></b-dropdown-item>
          <b-dropdown-item>
            <b-button type="submit" variant="primary">{{ $t("OK") }}</b-button>
          </b-dropdown-item>
        </b-form>
      </b-dropdown>
    </template>

    <b-row class="overflow-y-auto overflow-x-hidden w-100 m-1">
      <b-col :cols="1" style="padding: 0">
        <b-row
          v-for="page in indexation.pages"
          :key="page.id"
          :style="{ height: `${pageHeight}px` }"
          class="g-0 px-0 py-0 align-items-center page"
        >
          <TableOfContentsPage :page="page" />
        </b-row>
      </b-col>
      <b-col :cols="11" class="position-relative p-0">
        <template
          v-for="(entry, idx) in indexation.entries"
          :key="indexation.entries[idx].id"
        >
          <div
            class="position-absolute w-100 d-flex align-items-center justify-content-center"
            :style="{
              borderTop: '1px solid black',
              height: `${pageHeight}px`,
              top: `${pageHeight * (entry.position + entry.entirepages - 1)}px`,
            }"
          >
            <b-button
              v-if="showCreateEntryAfter(idx)"
              class="create-entry fw-bold position-absolute mx-md-n5 d-flex justify-content-center align-items-center"
              variant="success"
              @click="createEntry(entry.position + entry.entirepages)"
              >{{ $t("Ajouter une entrée") }}</b-button
            >
          </div>
          <TableOfContentsEntry
            v-model="indexation.entries[idx]"
            @on-entry-resize-stop="($event) => onEntryResizeStop(idx, $event)"
            @on-entry-drag-stop="($event) => onEntryDragStop(idx, $event)"
          />
        </template>
      </b-col>
    </b-row>
  </b-card>
</template>

<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { getEntryFromPage } from "~dumili-utils/entryPages";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import type { FullIndexation } from "~dumili-services/indexation";
import TableOfContentsEntry from "./TableOfContentsEntry.vue";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const { currentEntry } = storeToRefs(ui());
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const indexationEdit = ref() as Ref<
  Pick<FullIndexation, "price" | "releaseDate"> & {
    numberOfPages: number;
  }
>;

watch(
  indexation,
  () => {
    const { price, releaseDate } = indexation.value;
    indexationEdit.value = {
      numberOfPages: indexation.value.pages.length,
      price,
      releaseDate,
    };
  },
  { immediate: true },
);

const { currentPage, pageHeight } = storeToRefs(ui());
const { t: $t } = useI18n();

const hasAcceptedIssueSuggestion = computed(
  () => indexation.value.acceptedIssueSuggestion !== null,
);

const getInputProps = () => ({
  disabled: !hasAcceptedIssueSuggestion.value,
  style: hasAcceptedIssueSuggestion.value
    ? undefined
    : { cursor: "not-allowed" },
});

const showCreateEntryAfter = (entryIdx: number) => {
  const entry = indexation.value.entries[entryIdx];
  const nextEntry = indexation.value.entries[entryIdx + 1];
  return (
    (nextEntry && entry.position + entry.entirepages < nextEntry.position) ||
    (!nextEntry &&
      entry.position + entry.entirepages - 1 <
        indexationEdit.value.numberOfPages)
  );
};

const onEntryResizeStop = (entryIdx: number, height: number) => {
  indexation.value!.entries[entryIdx].entirepages = Math.max(
    0,
    Math.round(height / pageHeight.value),
  );
};

const onEntryDragStop = (entryIdx: number, y: number) => {
  indexation.value!.entries[entryIdx].position = 1 + y / pageHeight.value;
};

const createEntry = (position: number) =>
  indexationSocket.value!.createEntry(position);

const updateIndexation = () => {
  if (indexationEdit.value.numberOfPages < indexation.value.pages.length) {
    if (
      !confirm(
        $t(
          "Vous êtes sur le point de supprimer les {numberOfPagesToDelete} dernières pages de l'indexation. Êtes-vous sûr(e) ?",
          {
            numberOfPagesToDelete:
              indexation.value.pages.length -
              indexationEdit.value.numberOfPages,
          },
        ),
      )
    ) {
      indexationEdit.value.numberOfPages = indexation.value.pages.length;
      return;
    }
  }
  indexationSocket.value!.updateIndexation(indexationEdit.value);
};

watch(
  currentPage,
  (value) => {
    if (indexation.value && value !== undefined) {
      currentEntry.value = getEntryFromPage(
        indexation.value,
        indexation.value.pages.find(
          ({ pageNumber }) => pageNumber === value + 1,
        )!.id,
      );
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.table-of-contents {
  background-color: #eee;
  color: black;
  white-space: nowrap;
  user-select: none;

  :deep(.card-header) {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    :deep(a),
    :deep(h6) {
      color: #666;
    }

    h3 {
      margin: 6px 6px 0 6px;
      text-align: center;
    }
  }

  .col-auto {
    width: 100%;
  }

  :deep(ul) {
    overflow-x: auto;
  }

  :deep(.tab-content) {
    display: none;
  }
}

.entry-details {
  z-index: 1;
  &.current {
    width: 100%;
    z-index: 2;
    position: relative;
    .col {
      align-items: start;
      position: absolute;
      backdrop-filter: blur(5px);
      left: 10px;
      width: calc(100% - 2px);

      $background: rgba(238, 238, 238, 0.85);
      box-shadow: 0px 35px 5px -4px;
      color: #{$background};
    }
  }
}

.page {
  border-top: 1px solid black;
}
</style>
