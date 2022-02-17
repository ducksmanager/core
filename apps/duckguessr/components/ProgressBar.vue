<template>
  <b-progress :variant="progressbarVariant">
    <div class="position-absolute pt-2 w-100">
      <template v-if="remainingTime"> Guess the author! ({{ remainingTime }}) </template>
    </div>
    <b-progress-bar animated :value="remainingTime * (100 / availableTime)" />
  </b-progress>
</template>

<script>
import { computed } from '@nuxtjs/composition-api'

export default {
  name: 'ProgressBar',

  props: {
    availableTime: {
      type: Number,
      required: true,
    },
    remainingTime: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const remainingTimePercentage = computed(
      () => props.remainingTime * (100 / props.availableTime)
    )
    const progressbarVariant = computed(() => {
      if (remainingTimePercentage.value <= 20) {
        return 'danger'
      }
      if (remainingTimePercentage.value <= 40) {
        return 'warning'
      }
      return 'success'
    })
    return {
      remainingTimePercentage,
      progressbarVariant,
    }
  },
}
</script>

<style scoped></style>
