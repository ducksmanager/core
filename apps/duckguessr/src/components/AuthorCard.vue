<template>
  <b-col
    cols="4"
    :class="{
      author: true,
      selectable,
      enabled,
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
        <b-img :src="authorImageUrl" @error="setDefaultAuthorUrl()" />
      </div>
    </div>
  </b-col>
</template>
<script lang="ts" setup>
import { Author } from "~types/roundWithScoresAndAuthor";
const { author, enabled, selectable } = toRefs(
  defineProps<{
    author: Author;
    enabled: Boolean;
    selectable: Boolean;
  }>()
);

const authorImageUrl = ref("");
const setDefaultAuthorUrl = () => {
  authorImageUrl.value =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Interrogation_mark_with_material_shadows.jpg";
};

watch(
  () => author.value.personcode,
  (personcode) => {
    authorImageUrl.value = `https://inducks.org/creators/photos/${personcode}.jpg`;
  },
  {
    immediate: true,
  }
);
</script>
<style lang="scss">
.author {
  font-size: 12px;
  border-radius: 5px;
  pointer-events: none;

  @media (max-width: 767px) {
    font-size: 10px;
  }

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

  &.enabled {
    .author-image {
      opacity: 1;
    }
  }

  &.selectable {
    cursor: pointer;
    pointer-events: all;

    &:hover {
      outline: 1px solid lightgray;
    }
  }
}
</style>
