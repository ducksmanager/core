<template>
  <b-form ref="form" method="post">
    <b-row class="mt-3 align-items-center">
      <b-col sm="3" md="2">
        {{ $t("Abonnement au magazine") }}<br />
        <template v-if="isEdit">
          <PublicationSelect
            no-button
            :initial-country-code="
              editSubscription.publicationcode
                ? editSubscription.publicationcode.split('/')[0]
                : null
            "
            :initial-publication-code="editSubscription.publicationcode"
            @input="editSubscription.publicationcode = $event"
          />
        </template>
        <Publication
          v-else-if="publicationNames[publicationcode]"
          :publicationname="publicationNames[publicationcode]"
          :publicationcode="publicationcode"
        />
      </b-col>
      <b-col sm="3" md="2">
        {{ $t("du") }}
        <input
          v-if="isEdit"
          v-model="editSubscription.startDate"
          name="startDate"
          required
          class="form-control"
          type="date"
        />
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
        />
        <template v-else>
          {{ editSubscription.endDate }}
        </template>
      </b-col>
      <b-col sm="3" md="1" class="text-center m-2">
        <b-button
          v-if="isEdit"
          size="sm"
          @click="$emit('edit', editSubscription)"
        >
          {{ $t("OK") }}
        </b-button>
        <b-button v-else size="sm" @click="$emit('start-edit')">
          {{ $t("Modifier") }}
        </b-button>
      </b-col>
      <b-col sm="3" md="1" class="text-center m-2">
        <b-button v-if="isEdit" size="sm" @click="$emit('cancel-edit')">
          {{ $t("Annuler") }}
        </b-button>
        <b-button v-else size="sm" @click="$emit('delete')">
          {{ $t("Supprimer") }}
        </b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script setup lang="ts">
import { BButton, BCol, BForm, BRow } from "bootstrap-vue-3";

import { coa } from "~/stores/coa";

const {
  publicationcode = null,
  startDate = null,
  isEdit = null,
  endDate = null,
} = defineProps<{
  isEdit?: boolean;
  publicationcode?: string;
  startDate?: Date;
  endDate?: Date;
}>();

type EditSubscription = {
  publicationcode: string;
  startDate: string | null;
  endDate: string | null;
};

defineEmits<{
  (e: "delete"): void;
  (e: "edit", editSubscription: EditSubscription): void;
  (e: "start-edit"): void;
  (e: "cancel-edit"): void;
}>();
const editSubscription = $ref({
  publicationcode,
  startDate: startDate?.toISOString().split("T")[0],
  endDate: endDate?.toISOString().split("T")[0],
} as EditSubscription);
const publicationNames = $computed(() => coa().publicationNames);
</script>

<style scoped>

</style>
