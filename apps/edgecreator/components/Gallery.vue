<template>
  <div>
    <b-modal
      v-model="showChooseImageModal"
      :title="clickedImage"
      scrollable
      ok-title="Choose"
      @ok="chooseImage"
    >
      <img :alt="clickedImage" :src="getImageUrl(clickedImage)" />
    </b-modal>
    <b-modal v-model="showUploadModal" ok-only
      ><upload
        :photo="imageType === 'photos'"
        :edge="{
          country,
          magazine,
        }"
    /></b-modal>
    <b-alert v-if="!items.length" show variant="warning"
      >No items.
      <a href="javascript:void(0)" @click="showUploadModal = !showUploadModal">Upload new</a>
    </b-alert>
    <template v-else>
      <a href="javascript:void(0)" @click="showUploadModal = !showUploadModal">Upload new</a>
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
    ...mapState('editingStep', { editingStepOptions: 'stepOptions' }),
    items() {
      return this.imageType === 'elements' ? this.publicationElements : this.publicationPhotos
    },
    selected() {
      return this.imageType === 'elements'
        ? [this.editingStepOptions.src]
        : this.photoUrls[this.issuenumbers[0]] || []
    },
  },
  methods: {
    getImageUrl(elementFileName) {
      return `${process.env.EDGES_URL}/${this.country}/${
        this.imageType === 'elements' ? this.imageType : 'photos'
      }/${elementFileName}`
    },
    chooseImage() {
      if (this.imageType === 'elements') {
        this.$root.$emit('set-option', 'src', this.clickedImage)
      } else if (!(this.photoUrls[this.issuenumbers[0]] || []).includes(this.clickedImage)) {
        this.addPhotoUrl({ issuenumber: this.issuenumbers[0], filename: this.clickedImage })
      }
      this.clickedImage = null
    },
    ...mapMutations(['addPhotoUrl']),
  },
}
</script>

<style scoped>
.row.gallery {
  margin-top: 25px;
  height: 100px;
}

.row.gallery > div {
  height: 100%;
}

.row.gallery > div > img {
  cursor: pointer;
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.row.gallery > div.selected > img {
  outline: 2px solid #3b8070;
}

.img-thumbnail {
  background: transparent;
}
.img-thumbnail:hover {
  background: black;
}
</style>
