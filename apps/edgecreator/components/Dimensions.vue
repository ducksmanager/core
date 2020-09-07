<template>
  <b-card class="mb-2" style="max-width: 16rem">
    <b-row v-for="dimension in ['width', 'height']" :key="dimension">
      <b-col sm="4">
        <label :for="dimension">{{ dimension }}:</label>
      </b-col>
      <b-col sm="4">
        <b-form-input
          :id="dimension"
          :value="dimension === 'width' ? width : height"
          size="sm"
          autocomplete="off"
          type="number"
          @input="
            $emit(
              'change',
              dimension === 'width'
                ? { width: parseInt($event), height }
                : { width, height: parseInt($event) }
            )
          "
        ></b-form-input>
      </b-col>
      <b-col sm="2" class="text-left">
        <label :for="dimension">mm</label>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
export default {
  name: 'Dimensions',
  props: {
    width: { type: Number, default: 15 },
    height: { type: Number, default: 200 },
  },
}
</script>

<style scoped></style>
