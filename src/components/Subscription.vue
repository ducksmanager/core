<template>
  <BForm ref="form" method="post">
    <BRow class="mt-3 align-items-center">
      <BCol sm="3" md="2">
        {{ $t("Abonnement au magazine") }}<br>
        <template v-if="isEdit">
          <PublicationSelect
            no-button
            :initial-country-code="
              editSubscription.publicationCode
                ? editSubscription.publicationCode.split('/')[0]
                : null
            "
            :initial-publication-code="editSubscription.publicationCode"
            @input="editSubscription.publicationCode = $event"
          />
        </template>
        <Publication
          v-else-if="publicationNames[publicationCode]"
          :publicationname="publicationNames[publicationCode]"
          :publicationcode="publicationCode"
        />
      </BCol>
      <BCol sm="3" md="2">
        {{ $t("du") }}
        <input
          v-if="isEdit"
          v-model="editSubscription.startDate"
          name="startDate"
          required
          class="form-control"
          type="date"
        >
        <template v-else>
          {{ editSubscription.startDate }}
        </template>
        {{ $t("au") }}
        <input
          v-if="isEdit"
          v-model="editSubscription.endDate"
          name="startDate"
          required
          class="form-control"
          type="date"
        >
        <template v-else>
          {{ editSubscription.endDate }}
        </template>
      </BCol>
      <BCol sm="3" md="1" class="text-center m-2">
        <BButton
          v-if="isEdit"
          size="sm"
          @click="$emit('edit', editSubscription)"
        >
          {{ $t("OK") }}
        </BButton>
        <BButton v-else size="sm" @click="$emit('start-edit')">
          {{ $t("Modifier") }}
        </BButton>
      </BCol>
      <BCol sm="3" md="1" class="text-center m-2">
        <BButton v-if="isEdit" size="sm" @click="$emit('cancel-edit')">
          {{ $t("Annuler") }}
        </BButton>
        <BButton v-else size="sm" @click="$emit('delete')">
          {{ $t("Supprimer") }}
        </BButton>
      </BCol>
    </BRow>
  </BForm>
</template>

<script setup>
import { BButton, BCol, BForm, BRow } from 'bootstrap-vue-3'

import { coa } from '~/stores/coa'

const { endDate, publicationCode, startDate } = defineProps({
  id: {
    default: null,
    type: Number,
  },
  isEdit: {
    required: true,
    type: Boolean,
  },
  publicationCode: {
    default: null,
    type: String,
  },
  startDate: {
    default: null,
    type: Date,
  },
  endDate: {
    default: null,
    type: Date,
  },
})
defineEmits(['delete', 'edit', 'start-edit', 'cancel-edit'])
const editSubscription = {
  publicationCode,
  startDate: startDate && startDate.toISOString().split('T')[0],
  endDate: endDate && endDate.toISOString().split('T')[0],
}
const publicationNames = $computed(() => coa().publicationNames)
</script>

<style scoped>

</style>
