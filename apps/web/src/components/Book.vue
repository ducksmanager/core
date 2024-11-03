<template>
  <div ref="container" class="container flex-grow-1" @click.self="closeBook()">
    <div id="book" class="flip-book" @click.self="closeBook()">
      <slot name="table-of-contents" />

      <div
        v-for="(url, index) in urls"
        :key="`page-${index}`"
        class="page"
        :class="{ single: isSinglePageWithUrl }"
      >
        <slot v-if="index === 0" name="edge" />
        <div class="page-content" :class="{ 'first-page': index === 0 }">
          <div
            class="page-image"
            :class="{ opened: opening || opened }"
            :style="{
              backgroundImage: `url(${url})`,
              marginLeft: opening || opened ? '0' : `${edgeWidth}px`,
            }"
            @transitionend="onEndOpenCloseTransition()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PageFlip } from "page-flip";

const { urls, edgeWidth, coverRatio, coverHeight } = defineProps<{
  urls: string[];
  edgeWidth?: number;
  coverRatio: number;
  coverHeight?: number;
}>();
const emit = defineEmits<{ (e: "close-book"): void }>();
const slots = defineSlots<{
  edge(): unknown;
  "table-of-contents"(): unknown;
}>();

const container = ref<HTMLElement>();

const book = defineModel<PageFlip | undefined>("book");
const opened = defineModel<boolean>("opened", { default: false });
const opening = defineModel<boolean>("opening", { default: false });
const closing = defineModel<boolean>("closing", { default: false });
const currentPage = defineModel<number>("currentPage", { required: true });

const isSinglePageWithUrl = computed(() => urls.length === 1);
const isReadyToOpen = computed(
  () => coverRatio && !(isClosable.value && !edgeWidth) && urls.length,
);
const isClosable = computed(() => "edge" in slots);

const onEndOpenCloseTransition = () => {
  if (opening.value) {
    opening.value = false;
    opened.value = true;
  }
  if (closing.value) {
    closing.value = false;
    emit("close-book");
  }
};

const closeBook = () => {
  if (isClosable.value) {
    emit("close-book");
  }
};
onMounted(() => {
  watch(
    isReadyToOpen,
    (newValue) => {
      if (newValue && coverRatio) {
        const height = coverHeight || container.value!.clientHeight;
        debugger;
        book.value = new PageFlip(document.getElementById("book")!, {
          width: height / coverRatio,
          height,

          maxShadowOpacity: 0.5,
          showCover: true,
          usePortrait: false,
          mobileScrollSupport: false,
        });
      }
    },
    { immediate: true },
  );
});

watch(book, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    newValue.loadFromHTML(document.querySelectorAll(".page"));

    newValue.on("flip", ({ data }) => {
      currentPage.value = parseInt(data.toString());
    });

    setTimeout(() => {
      opening.value = true;
    }, 50);
  }
});

watch(currentPage, (newValue) => {
  if (book.value) {
    book.value.flip(newValue);
  }
});

defineExpose({
  book,
});
</script>

<style scoped lang="scss">
.flip-book {
  display: none;
  margin: auto;
  background-size: cover;
  min-width: initial !important;
  min-height: initial !important;
}

.page {
  color: #785e3a;

  overflow: hidden;

  .page-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
    background: white;

    .page-image {
      height: 100%;
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
    }

    &.first-page {
      background: transparent;

      .page-image {
        background-size: cover;
        transform: rotate3d(0, 1, 0, -90deg);
        transform-origin: left;
        transition: all 1s linear;

        &.opened {
          transform: rotate3d(0, 1, 0, 0deg);
        }
      }
    }
  }

  &.--left {
    // for left page (property will be added automatically)
    border-right: 0;

    .page-image {
      box-shadow: inset -7px 0 30px -7px rgba(0, 0, 0, 0.4);
    }
  }

  &.--right {
    // for right page (property will be added automatically)
    border-left: 0;

    .page-image {
      box-shadow: inset 7px 0 30px -7px rgba(0, 0, 0, 0.4);
    }
  }

  &.hard {
    // for hard page
    background-color: #f2e8d9;
  }

  &.page-cover {
    background-color: #e3d0b5;
    color: #785e3a;
  }

  &.single {
    left: initial !important;
    right: 0 !important;
  }
}
</style>
