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
    <div
      class="author-image"
      :style="{
        'background-image': `url('https://inducks.org/creators/photos/${author.personcode}.jpg')`,
      }"
    >
      <div
        class="position-absolute"
        style="bottom: 10px; background: rgba(255, 255, 255, 0.5)"
      >
        <b-img
          :src="`https://www.countryflags.io/${author.personnationality}/flat/16.png`"
        />
        {{ author.personfullname }} ({{ author.personrole }})
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
})
</script>
<style lang="scss">
.author {
  font-size: 12px;
  border-radius: 5px;
  pointer-events: none;
}
</style>
