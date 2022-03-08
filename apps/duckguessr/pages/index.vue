<template>
  <div>
    <b-alert v-if="isAnonymous" show variant="warning">
      You are not connected. You can still play but you won't keep any won medals.
    </b-alert>
    <b-card-group deck>
      <b-card
        v-for="{ title, name, images, authors } in datasets"
        :key="name"
        :title="title"
        img-src="https://picsum.photos/600/300/?image=25"
        :img-alt="title"
        img-top
        align="center"
        @click="$router.push(`/setup/${name}`)"
      >
        <b-card-footer>
          {{ t('Images: {images}, authors: {authors}', { images, authors }) }}
        </b-card-footer>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, useContext } from '@nuxtjs/composition-api'
import { getUser } from '@/components/user'
const { isAnonymous } = getUser()
import { useI18n } from 'vue-i18n'

export default {
  name: 'Welcome',
  setup() {
    const { $axios } = useContext()
    const { t } = useI18n()

    const datasets = ref([] as Array<any>)

    onMounted(async () => {
      datasets.value = (await $axios.$get(`/api/dataset`)).datasets
    })

    return {
      t,
      datasets,
      isAnonymous,
    }
  },
}
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;
}
</style>
