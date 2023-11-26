<template>
  <b-form ref="form" method="post">
    <b-row class="mt-3 align-items-center">
      <b-col sm="3" md="2">
        {{ $t("Abonnement au magazine") }}<br />
        <template v-if="isEdit">
          <PublicationSelect
            no-button
            :initial-countrycode="
              editSubscription.publicationcode
                ? editSubscription.publicationcode.split('/')[0]
                : undefined
            "
            :initial-publicationcode="
              editSubscription.publicationcode || undefined
            "
            @input="editSubscription.publicationcode = $event"
          />
        </template>
        <Publication
          v-else-if="
            editSubscription.publicationcode &&
            publicationNames[editSubscription.publicationcode]
          "
          :publicationname="publicationNames[editSubscription.publicationcode]!"
          :publicationcode="editSubscription.publicationcode"
        />
      </b-col>
      <b-col sm="3" md="2">
        {{ $t("du") }}
        <input
          v-if="isEdit"
          v-model="startDateAsString"
          name="startDate"
          required
          class="form-control"
          type="date"
        />
        <template v-else>
          {{ startDateAsString }}
        </template>
        {{ $t("au") }}
        <input
          v-if="isEdit"
          v-model="endDateAsString"
          name="startDate"
          required
          class="form-control"
          type="date"
        />
        <template v-else>
          {{ endDateAsString }}
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
import { SubscriptionTransformed } from "~/stores/collection";
import { subscription } from "~prisma-clients/client_dm";

const { isEdit, subscription } = defineProps<{
  isEdit?: boolean;
  subscription: SubscriptionTransformed;
}>();

const editSubscription = $ref(subscription);

const startDateAsString = $ref(
  editSubscription.startDate
    ? editSubscription.startDate.toISOString().split("T")[0]
    : "",
);
const endDateAsString = $ref(
  editSubscription.endDate
    ? editSubscription.endDate.toISOString().split("T")[0]
    : "",
);

watch($$(startDateAsString), (newValue) => {
  if (newValue) {
    editSubscription.startDate = new Date(Date.parse(newValue));
  }
});

watch($$(endDateAsString), (newValue) => {
  if (newValue) {
    editSubscription.endDate = new Date(Date.parse(newValue));
  }
});

defineEmits<{
  (e: "delete"): void;
  (e: "edit", editSubscription: SubscriptionTransformed): void;
  (e: "start-edit"): void;
  (e: "cancel-edit"): void;
}>();

const { publicationNames } = storeToRefs(coa());
</script>
