<template>
  <b-card class="mb-2" style="max-width: 16rem">
    <b-row v-for="dimension in ['width', 'height']" :key="dimension">
      <b-col cols="4">
        <label :for="dimension">{{ $t(ucFirst(dimension)) }}:</label>
      </b-col>
      <b-col cols="5">
        <b-form-input
          :id="dimension"
          :value="dimension === 'width' ? width : height"
          size="sm"
          autocomplete="off"
          type="number"
          :min="dimension === 'width' ? 5 : 100"
          :max="dimension === 'width' ? 50 : 350"
          @input="
            $emit(
              'change',
              dimension === 'width'
                ? { width: parseInt($event), height }
                : { width, height: parseInt($event) }
            )
          "
        />
      </b-col>
      <b-col cols="2" class="text-left">
        <label :for="dimension">mm</label>
      </b-col>
    </b-row>
  </b-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from '@nuxtjs/composition-api'

const props = defineProps<{
  width?: number
  height?: number
}>()

const width = ref(props.width || 15)
const height = ref(props.height || 200)

const emit = defineEmits<{
  (e: 'change', value: { width: number; height: number }): void
}>()

onMounted(() => {
  emit('change', {
    width: width.value,
    height: height.value,
  })
})

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length)
</script>

<style scoped></style>
