<template>
  <div>
    <b-modal v-model="showUploadModal" ok-only
      ><upload
        :edge="{
          country,
          magazine,
        }"
    /></b-modal>
    <b-alert v-if="!galleryItems.length" show variant="warning"
      >No items.
      <a href="javascript:void(0)" @click="showUploadModal = !showUploadModal">Upload new</a>
    </b-alert>
    <template v-else>
      <a href="javascript:void(0)" @click="showUploadModal = !showUploadModal">Upload new</a>
      <b-row ref="gallery" class="gallery">
        <b-col
          v-for="image in galleryItems"
          :key="image"
          sm="2"
          :class="{
            selected: image === selectedImage,
          }"
          @click="$emit('image-click', { image })"
        >
          <b-img-lazy
            v-b-modal.image-modal
            v-b-tooltip.hover
            thumbnail
            class="fit"
            :src="getElementUrl(image)"
            :alt="image"
            :title="image"
          ></b-img-lazy>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Upload from '@/components/Upload'

export default {
  name: 'Gallery',
  components: {
    Upload,
  },
  props: {
    selectedImage: { type: String, default: null },
  },
  data: () => ({
    showUploadModal: false,
  }),
  computed: {
    ...mapState(['country', 'magazine', 'galleryItems']),
  },
  methods: {
    getElementUrl(elementFileName) {
      return `${process.env.EDGES_URL}/${this.country}/elements/${elementFileName}`
    },
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
