<template>
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
        {{ t('Images') }}: {{ images }}, {{ $t('authors') }}: {{ authors }}
      </b-card-footer>
    </b-card>
  </b-card-group>
</template>

<script lang="ts">
import { onMounted, ref, useContext } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'

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
