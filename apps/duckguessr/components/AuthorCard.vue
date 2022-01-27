<template>
  <b-col
    cols="4"
    :class="{
      author: true,
      selectable,
      'p-1': true,
    }"
    @click="$emit('select', author.personcode)"
  >
    <div
      class="author-image"
      :style="{ backgroundImage: `url('${authorImageUrl}')` }"
    >
      <div class="author-name position-absolute">
        <flag :country="author.personnationality" />
        {{ author.personfullname }}
      </div>
      <div hidden>
        <b-img
          :src="authorImageUrl"
          @error="authorImageUrl = defaultAuthorUrl"
        />
      </div>
    </div>
  </b-col>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'AuthorCard',
  props: {
    author: {
      type: Object,
      required: true,
    },
    selectable: {
      type: Boolean,
      required: true,
    },
  },

  setup({ author: { personcode } }) {
    const authorImageUrl = ref('')
    const defaultAuthorUrl =
      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Interrogation_mark_with_material_shadows.jpg'

    watch(
      () => personcode,
      (personcode) => {
        authorImageUrl.value = `https://inducks.org/creators/photos/${personcode}.jpg`
      },
      {
        immediate: true,
      }
    )
    return {
      authorImageUrl,
      defaultAuthorUrl,
    }
  },
})
</script>
<style lang="scss">
.author {
  font-size: 12px;
  border-radius: 5px;
  pointer-events: none;

  .author-image {
    background-size: cover;
    background-position: center;
    height: 100%;
    border-radius: 5px;
    opacity: 0.2;

    .author-name {
      bottom: 10px;
      background-color: rgba(127, 127, 127, 0.85);
    }
  }

  &.selectable {
    cursor: pointer;
    pointer-events: all;

    &:hover {
      outline: 1px solid lightgray;
    }

    .author-image {
      opacity: 1;
    }
  }
}
</style>
