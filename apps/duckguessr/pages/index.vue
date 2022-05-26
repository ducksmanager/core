<template>
  <b-card-group deck>
    <b-card
      v-for="{ title, description, name, images, authors } in datasets"
      :key="name"
      :title="t(title)"
      img-top
      align="center"
      @click="$router.push(`/setup/${name}`)"
    >
      <b-card-header class="my-2 bg-transparent border-0 small">
        {{ t(description) }}
      </b-card-header>
      <b-card-footer>
        {{ t('Images') }}: {{ images }}, {{ t('authors') }}: {{ authors }}
      </b-card-footer>
    </b-card>
  </b-card-group>
</template>

<script lang="ts" setup>
import { onMounted, ref } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import { useAxios } from '@vueuse/integrations/useAxios'

const { t } = useI18n()

const datasets = ref([] as Array<any>)

onMounted(async () => {
  datasets.value = (await useAxios(`/api/dataset`)).data.value.datasets
})
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;
}
</style>
