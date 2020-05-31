<template>
  <b-row class="gallery">
    <b-col
      v-for="image in galleryItems"
      :key="image"
      sm="2"
      @click="$emit('image-click', { image })"
    >
      <b-img-lazy
        v-b-modal.image-modal
        thumbnail
        class="fit"
        :class="{
          selected: image === selectedImage
        }"
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
    ...mapState(['edge', 'galleryItems'])
  },
  methods: {
    getElementUrl(elementFileName) {
      return `http://localhost:8000/edges/${this.edge.country}/elements/${elementFileName}`
    }
  }
}
</script>

<style scoped></style>
