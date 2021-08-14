<template>
  <b-col
    cols="4"
    :class="{
      author: true,
      selected,
      selectable,
      'p-1': true,
    }"
    @click="$emit('select', author)"
  >
    <div class="author-image" :style="{ backgroundImage: authorImageUrl }">
      <div
        class="position-absolute"
        style="bottom: 10px; background: rgba(255, 255, 255, 0.5)"
      >
        <flag :country="author.personnationality" />
        {{ author.personfullname }}
      </div>
    </div>
  </b-col>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

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
    selected: {
      type: Boolean,
      required: true,
    },
  },

  setup({ author: { personcode } }) {
    return {
      authorImageUrl: `url('https://inducks.org/creators/photos/${personcode}.jpg')`,
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
  }

  &.selectable {
    cursor: pointer;
    pointer-events: all;

    &:hover {
      outline: 1px solid lightgray;
    }

    &.selected {
      outline: 1px solid black;
    }

    .author-image {
      opacity: 1;
    }
  }
}
</style>
