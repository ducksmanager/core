<template>
  <b-alert v-if="loading" show variant="info">{{ $t('Loading...') }} </b-alert>
  <div v-else-if="items">
    <b-modal
      v-if="clickedImage"
      v-model="showChooseImageModal"
      :title="clickedImage.name"
      scrollable
      :ok-title="$t('Choose')"
      @ok="$emit('change', clickedImage.name)"
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
    <b-alert v-if="!items.length" show variant="warning"
      >{{ $t('No item in this section.') }}
      <a v-if="allowUpload" href="javascript:void(0)" @click="showUploadModal = !showUploadModal">{{
        $t('Upload new')
      }}</a>
    </b-alert>
    <template v-else>
      <a v-if="allowUpload" href="javascript:void(0)" @click="showUploadModal = !showUploadModal">{{
        $t('Upload new')
      }}</a>
      <b-row ref="gallery" class="gallery mt-1">
        <b-col
          v-for="item in items"
          :key="item.name"
          sm="2"
          :class="{
            'my-1': true,
            selected: selected.includes(item.name),
            disabled: item.disabled,
          }"
          @click="onSelect(item)"
        >
          <a v-if="imageType === 'edges'" class="position-absolute">
            <b-icon-emoji-smile-fill
              v-if="item.quality == 1"
              variant="success"
              :title="item.tooltip"
            />
            <b-icon-emoji-neutral-fill
              v-else-if="item.quality > 0"
              variant="warning"
              :title="item.tooltip"
            />
            <b-icon-emoji-frown-fill v-else variant="danger" :title="item.tooltip" />
          </a>
          <b-img-lazy
            v-b-tooltip.hover
            thumbnail
            class="fit"
            :src="item.url"
            :alt="item.name"
            :title="item.name"
          ></b-img-lazy>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Upload from '@/components/Upload'
import legacyDbMixin from '@/mixins/legacyDbMixin'
import { BIconEmojiFrownFill, BIconEmojiNeutralFill, BIconEmojiSmileFill } from 'bootstrap-vue'

export default {
  name: 'Gallery',
  components: {
    Upload,
    BIconEmojiSmileFill,
    BIconEmojiNeutralFill,
    BIconEmojiFrownFill,
  },
  mixins: [legacyDbMixin],
  props: {
    loading: { type: Boolean, default: false },
    imageType: { type: String, required: true },
    selected: { type: Array, default: () => [] },
    allowUpload: { type: Boolean, default: true },
    items: { type: Array, required: true },
  },
  data: () => ({
    clickedImage: null,
    showUploadModal: false,
    showChooseImageModal: false,
  }),
  computed: {
    ...mapState(['country', 'magazine', 'issuenumbers']),
  },
  methods: {
    onSelect(item) {
      if (!item.disabled) {
        this.clickedImage = item
        this.showChooseImageModal = true
      }
    },
  },
}
</script>

<style scoped lang="scss">
.row.gallery {
  height: 100px;

  > div {
    height: 100%;

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
</style>
