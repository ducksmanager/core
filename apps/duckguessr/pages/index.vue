<template>
  <div>
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
        <b-card-footer> Images: {{ images }}, authors: {{ authors }} </b-card-footer>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'Welcome',
  setup() {
    const { $axios } = useContext()

    const datasets = ref([] as Array<any>)

    onMounted(async () => {
      datasets.value = (await $axios.$get(`/api/dataset`)).datasets
    })

    return {
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
