<template>
  <b-alert v-if="loading" :model-value="true" variant="info"
    >{{ $t("Loading...") }}
  </b-alert>
  <div v-else-if="items">
    <b-modal
      v-if="clickedImage"
      v-model="showChooseImageModal"
      :title="clickedImage.name"
      scrollable
      :ok-title="$t('Choose')"
      @ok="clickedImage && emit('change', clickedImage.name)"
    >
      <img :alt="clickedImage.name" :src="clickedImage.url" />
    </b-modal>
    <b-modal v-model="showUploadModal" ok-only>
      <upload
        :photo="imageType === 'photos'"
        :edge="{
          country,
          magazine,
          issuenumber: issuenumbers[0],
        }"
      />
    </b-modal>
    <b-alert v-if="!items.length" :model-value="true" variant="warning"
      >{{ $t("No item in this section.") }}
      <a
        v-if="allowUpload"
        href="javascript:void(0)"
        @click="showUploadModal = !showUploadModal"
        >{{ $t("Upload new") }}</a
      >
    </b-alert>
    <template v-else>
      <a
        v-if="allowUpload"
        href="javascript:void(0)"
        @click="showUploadModal = !showUploadModal"
        >{{ $t("Upload new") }}</a
      >
      <b-row ref="gallery" class="gallery mt-1">
        <b-col
          v-for="item in items"
          :key="item.name"
          sm="2"
          :class="{
            'mt-1': true,
            'mb-4': true,
            selected: selected.includes(item.name),
            disabled: item.disabled,
          }"
          @click="onSelect(item)"
        >
          <a v-if="imageType === 'edges'" class="position-relative">
            <i-bi-emoji-smile-fill
              v-if="item.quality === 1"
              class="variant-success"
              :title="item.tooltip"
            />
            <i-bi-emoji-neutral-fill
              v-else-if="item.quality > 0"
              class="variant-warning"
              :title="item.tooltip"
            />
            <i-bi-emoji-frown-fill
              v-else
              class="variant-danger"
              :title="item.tooltip"
            />
          </a>
          <b-img
            v-b-tooltip="{ title: item.name }"
            thumbnail
            lazy
            class="fit"
            :src="item.url"
            :alt="item.name"
          ></b-img>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { main } from "~/stores/main";
import { GalleryItem } from "~/types/GalleryItem";

withDefaults(
  defineProps<{
    loading?: boolean;
    imageType: string;
    selected?: string[];
    allowUpload?: boolean;
    items: GalleryItem[];
  }>(),
  {
    loading: false,
    selected: () => [],
    allowUpload: true,
  }
);

const emit = defineEmits<(e: "change", value: string) => void>();

const clickedImage = ref(null as GalleryItem | null);
const showUploadModal = ref(false as boolean);
const showChooseImageModal = ref(false as boolean);

const country = computed(() => main().country);
const magazine = computed(() => main().magazine);
const issuenumbers = computed(() => main().issuenumbers);

const onSelect = (item: GalleryItem) => {
  if (!item.disabled) {
    clickedImage.value = item;
    showChooseImageModal.value = true;
  }
};
</script>

<style scoped lang="scss">
.row.gallery {
  > div {
    height: 100px;

    > img {
      cursor: pointer;
      object-fit: contain;
      width: 100%;
      height: 100%;
    }

    &.locked {
      img {
        cursor: not-allowed;
      }
    }

    &.disabled,
    &.disabled > img {
      cursor: not-allowed;
    }

    &.selected img {
      outline: 2px solid #3b8070;
    }
  }
}

.img-thumbnail {
  background: transparent;

  &:hover {
    background: black;
  }
}

.variant-success {
  color: #28a745;
}

.variant-warning {
  color: #ffc107;
}

.variant-danger {
  color: #dc3545;
}
</style>
