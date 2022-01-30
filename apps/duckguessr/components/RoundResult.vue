<template>
  <b-col
    align-self="center"
    cols="3"
    class="round-card my-3"
    :style="{
      'background-image': `url('${imageUrl}')`,
    }"
  >
    <div
      class="author-banner mx-auto"
      :style="{
        'background-image': `url('${personUrl}')`,
      }"
    >
      <b-img class="d-none" :src="personUrl" @error="setDefaultAuthorUrl()" />
      <flag :country="round.personnationality" />&nbsp;{{
        round.personfullname
      }}
    </div>
  </b-col>
</template>

<script lang="ts">
import { ref } from '@nuxtjs/composition-api'

import { RoundWithScoresAndAuthor } from '~/types/roundWithScoresAndAuthor'

export default {
  props: {
    round: {
      type: Object as () => RoundWithScoresAndAuthor,
      required: true,
    },
  },

  setup(props: any) {
    const personUrl = ref(
      `https://inducks.org/creators/photos/${props.round.personcode}.jpg`
    )
    const setDefaultAuthorUrl = () => {
      personUrl.value =
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Interrogation_mark_with_material_shadows.jpg'
    }

    return {
      personUrl,
      setDefaultAuthorUrl,
      imageUrl: `${process.env.CLOUDINARY_URL_ROOT}/${props.round.sitecode_url}`,
    }
  },
}
</script>

<style scoped lang="scss">
.round-card {
  display: flex;
  align-items: flex-end;
  height: 200px;
  background-size: 90%;
  background-repeat: no-repeat;
  background-position: center;

  .author-banner {
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    bottom: 0;
    right: 0;
    padding: 5px 0 0 60px;
    background-color: rgba(127, 127, 127, 0.85);
    background-size: 50px auto;
    background-repeat: no-repeat;
    text-align: center;

    .author-image {
      width: 40px;
      height: 40px;
      background-size: cover;
      border-radius: 25px;
      margin: 0 20px;
    }
  }
}
</style>
