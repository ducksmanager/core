<template>
  <b-col
    cols="4"
    :class="{
      author: true,
      selectable,
      enabled,
      'p-1': true,
    }"
    @click="emit('select', author.personcode)"
  >
    <div
      class="author-image"
      :style="{ backgroundImage: `url('${authorImageUrl}')` }"
    >
      <div class="author-name position-absolute">
        <flag
          v-if="author.nationalitycountrycode"
          :country="author.nationalitycountrycode"
        />
        {{ author.fullname }}
      </div>
      <div hidden>
        <b-img :src="authorImageUrl" @error="setDefaultAuthorUrl()" />
      </div>
    </div>
  </b-col>
</template>
<script lang="ts" setup>
import type { Author } from "~duckguessr-types/roundWithScoresAndAuthor";

const { author, enabled, selectable } = defineProps<{
  author: Author;
  enabled: boolean;
  selectable: boolean;
}>();

const emit = defineEmits<{
  (e: "select", personcode: string): void;
}>();

const authorImageUrl = ref("");
const setDefaultAuthorUrl = () => {
  authorImageUrl.value =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Interrogation_mark_with_material_shadows.jpg";
};

watch(
  () => author,
  ({ personcode }) => {
    authorImageUrl.value = `https://inducks.org/creators/photos/${personcode}.jpg`;
  },
  {
    immediate: true,
  },
);
</script>
<style lang="scss">
.author {
  min-width: 150px;
  min-height: 150px;
  display: flex;
  position: relative;
  font-size: 12px;
  border-radius: 5px;
  pointer-events: none;

  @media (max-width: 767px) {
    font-size: 10px;
  }

  .author-image {
    background-size: cover;
    background-position: center;
    border-radius: 5px;
    opacity: 0.2;
    flex-grow: 1;

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
