<template>
  <b-container
    fluid
    class="d-flex flex-column align-items-center justify-content-center flex-grow-1 overflow-y-auto"
  >
    <b-row
      v-if="pages"
      ref="imagesRef"
      align-h="center"
      class="overflow-y-auto"
    >
      <b-col
        v-for="({ image, id, pageNumber }, idx) of pages"
        :id="`page-image-${idx}`"
        :key="id"
        v-element-visibility="[
          (visible) => {
            if (visible) {
              imagesInViewport.add(id);
            } else {
              imagesInViewport.delete(id);
            }
          },
          { threshold: 1 },
        ]"
        class="position-relative d-flex justify-content-center align-items-center p-3 pb-5 border"
        :class="{ selectable, selected: selectedId === id }"
        cols="12"
        md="4"
        @click="selectedId = id"
      >
        <template v-if="hoveredEntryPageNumbers?.includes(pageNumber)">
          <div
            :class="`overlay kind-${hoveredEntry!.acceptedStoryKind?.storyKindRows.kind} striped`"
          ></div>
        </template>
        <b-button
          v-if="image"
          variant="danger"
          class="position-absolute top-0 mt-2 text-center opacity-50 opacity-100-hover"
          @click="disconnectPageUrl(id)"
        >
          {{ $t("Désassocier l'image") }}
        </b-button>
        <b-img
          class="cursor-move"
          :class="{ 'w-100': !image, 'h-100': !image }"
          lazy
          blank-color="lightgrey"
          :blank="image === null"
          :src="image?.url"
          fluid
        />
        <b-button
          v-if="!image"
          class="position-absolute center"
          variant="success"
          @click="uploadPageNumber = pageNumber"
          >{{ $t("Ajouter") }}</b-button
        >
        <div class="position-absolute bottom-0 text-center">
          {{ $t("Page {pageNumber}", { pageNumber }) }}
        </div>
      </b-col>
    </b-row>
    <b-container v-else>{{ $t("Chargement...") }}</b-container>
    <upload-modal
      v-if="uploadablePagesWithoutOverwrite.length"
      :upload-page-number="uploadPageNumber"
      :pages-without-overwrite="uploadablePagesWithoutOverwrite"
      :pages-allow-overwrite="uploadablePagesAllowOverwrite"
      @done="loadIndexation"
    />
  </b-container>
</template>
<script lang="ts" setup>
import {
  moveArrayElement,
  useSortable,
} from "@vueuse/integrations/useSortable";
import { vElementVisibility } from "@vueuse/components";

import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { ui } from "~/stores/ui";
import { suggestions } from "~/stores/suggestions";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const { loadIndexation } = suggestions();

const imagesInViewport = ref(new Set<number>());

const { pages } = defineProps<{
  pages: { image: { url: string } | null; id: number; pageNumber: number }[];
  selectable?: boolean;
}>();

const getUploadablePages = (onlyIncludeEmptyPages: boolean) =>
  pages.filter(
    ({ pageNumber }) =>
      pageNumber >= uploadPageNumber.value! &&
      pageNumber <
        uploadPageNumber.value! +
          maxUploadableImagesFromPageNumber(
            uploadPageNumber.value!,
            onlyIncludeEmptyPages,
          ),
  );

const uploadablePagesAllowOverwrite = computed(() => getUploadablePages(false));

const uploadablePagesWithoutOverwrite = computed(() =>
  getUploadablePages(true),
);

defineSlots<{
  default(props: { issuecode: string }): never;
}>();

const emit = defineEmits<{
  (e: "selected", id: number): void;
}>();

const { t: $t } = useI18n();

const uploadPageNumber = ref<number>();
const maxUploadableImagesFromPageNumber = (
  pageNumber: number,
  onlyIncludeEmptyPages: boolean,
) => {
  const subsequentPages = pages
    .filter((page) => page.pageNumber > pageNumber)
    .sort((a, b) => a.pageNumber - b.pageNumber);

  const firstBreakIndex = subsequentPages.findIndex((page) =>
    onlyIncludeEmptyPages ? page.image : false,
  );

  return firstBreakIndex === -1
    ? subsequentPages.length + 1
    : firstBreakIndex + 1;
};

const { visiblePages, currentPage, hoveredEntry, hoveredEntryPageNumbers } =
  storeToRefs(ui());

const imagesRef = ref<HTMLElement>();

useSortable(imagesRef, pages, {
  multiDrag: true,
  selectedClass: "selected",
  fallbackTolerance: 3,
  animation: 150,

  onUpdate: async (e: Event) => {
    const event = e as unknown as { oldIndex: number; newIndex: number };
    moveArrayElement(pages, event.oldIndex, event.newIndex, e);
    nextTick(async () => {
      await indexationSocket.value?.swapPageUrls(
        pages[event.oldIndex].pageNumber,
        pages[event.newIndex].pageNumber,
      );
    });
  },
});

const selectedId = ref<number>();

const disconnectPageUrl = async (id: number) => {
  await indexationSocket.value!.setPageUrl(id, null);
};

watch(selectedId, (id) => {
  if (id) {
    emit("selected", id);
  }
});

watch(currentPage, (value) => {
  document.getElementById(`page-image-${value}`)?.scrollIntoView();
});

watch(
  imagesInViewport,
  (value) => {
    visiblePages.value = value;
  },
  { immediate: true },
);
</script>
<style scoped lang="scss">
.col {
  flex-grow: 1;
  pointer-events: none;

  &.selectable {
    cursor: pointer;
    pointer-events: all;

    &.selected {
      border: 2px solid #0d6efd;
      border-radius: 0.25rem;
    }
  }
}
</style>
