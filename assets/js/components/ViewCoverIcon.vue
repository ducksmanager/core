<template>
  <b-icon-eye-fill
    v-once
    :id="`issue-details-${issueNumber}`"
    :class="{
      'mx-2': true,
      [`can-show-book-${hasCover}`]: true,
    }"
    :alt="viewText"
    @click="$emit('click', $event)"
  />
</template>
<script setup>
import { BIconEyeFill } from "bootstrap-icons-vue";
import { defineProps } from "vue";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
let viewText = $computed(() => $t("Voir"));

defineEmits(["click"]);

defineProps({
  issueNumber: {
    type: String,
    required: true,
  },
  hasCover: {
    type: Boolean,
    default: true,
  },
});
</script>
<style scoped lang="scss">
.can-show-book-undefined {
  cursor: initial;
}

.can-show-book-false {
  cursor: not-allowed;
}

.can-show-book-true {
  cursor: pointer;
}
</style>