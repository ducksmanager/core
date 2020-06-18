<template>
  <b-row ref="gallery" class="gallery">
    <b-col
      v-for="image in galleryItems"
      :key="image"
      sm="2"
      :class="{
        selected: image === selectedImage
      }"
      @click="$emit('image-click', { image })"
    >
      <b-img-lazy
        v-b-modal.image-modal
        thumbnail
        class="fit"
        :src="getElementUrl(image)"
        :alt="image"
        :title="image"
      ></b-img-lazy>
    </b-col>
  </b-row>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Gallery',
  props: {
    selectedImage: { type: String, default: null }
  },
  computed: {
    ...mapState(['country', 'galleryItems'])
  },
  methods: {
    getElementUrl(elementFileName) {
      return `${process.env.EDGES_URL}/${this.country}/elements/${elementFileName}`
    }
  }
}
</script>

<style scoped>
.row.gallery {
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
