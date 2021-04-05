<template>
  <div>
    <b-modal
      v-model="showChooseImageModal"
      :title="clickedImage"
      scrollable
      :ok-title="$t('Choose')"
      @ok="chooseImage"
    >
      <img :alt="clickedImage" :src="getImageUrl(clickedImage)" />
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
      <a href="javascript:void(0)" @click="showUploadModal = !showUploadModal">{{
        $t('Upload new')
      }}</a>
    </b-alert>
    <template v-else>
      <a href="javascript:void(0)" @click="showUploadModal = !showUploadModal">{{
        $t('Upload new')
      }}</a>
      <b-row ref="gallery" class="gallery">
        <b-col
          v-for="image in items"
          :key="image"
          sm="2"
          :class="{
            selected: selected.includes(image),
          }"
          @click="
            clickedImage = image
            showChooseImageModal = true
          "
        >
          <b-img-lazy
            v-b-tooltip.hover
            thumbnail
            class="fit"
            :src="getImageUrl(image)"
            :alt="image"
            :title="image"
          ></b-img-lazy>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import Upload from '@/components/Upload'

export default {
  name: 'Gallery',
  components: {
    Upload,
  },
  props: {
    imageType: { type: String, required: true },
    selected: { type: Array, default: () => [] },
  },
  data: () => ({
    clickedImage: null,
    showUploadModal: false,
    showChooseImageModal: false,
  }),
  computed: {
    ...mapState([
      'country',
      'magazine',
      'issuenumbers',
      'publicationElements',
      'publicationPhotos',
      'photoUrls',
    ]),
    items() {
      return this.imageType === 'elements' ? this.publicationElements : this.publicationPhotos
    },
  },
  methods: {
    getImageUrl(elementFileName) {
      return new RegExp(process.env.EDGES_URL).test(elementFileName)
        ? elementFileName
        : `${process.env.EDGES_URL}/${this.country}/${
            this.imageType === 'elements' ? this.imageType : 'photos'
          }/${elementFileName}`
    },
    chooseImage() {
      if (this.imageType === 'elements') {
        this.$root.$emit('set-options', { src: this.clickedImage })
      } else if (!(this.photoUrls[this.issuenumbers[0]] || []).includes(this.clickedImage)) {
        this.setPhotoUrl({ issuenumber: this.issuenumbers[0], filename: this.clickedImage })
      }
      this.clickedImage = null
    },
    ...mapMutations(['setPhotoUrl']),
  },
}
</script>

<style scoped lang="scss">
.row.gallery {
  margin-top: 25px;
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

    &.selected > img {
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
