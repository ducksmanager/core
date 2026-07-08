<template>
  <b-modal
    v-model="show"
    :title="$t('Confirmation')"
    footer-class="d-flex justify-content-between"
  >
    {{ $t("Voulez-vous vraiment supprimer cette entrée ?") }}
    <template #footer
      ><b-button @click="$emit('confirm')">{{
        $t("Oui, supprimer l'entrée")
      }}</b-button>
      <b-button @click="show = false">{{
        $t("Non, annuler la suppression")
      }}</b-button></template
    >
  </b-modal>
</template>
<script setup lang="ts">
const show = defineModel<boolean>("show", { required: true });

defineEmits<{
  confirm: [];
}>();
</script>
