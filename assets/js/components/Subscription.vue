<template>
  <b-form
    ref="form"
    method="post"
  >
    <b-row
      class="mt-3 align-items-center"
    >
      <b-col
        sm="3"
        md="2"
      >
        {{ $t('Abonnement au magazine') }}<br>
        <template v-if="isEdit">
          <PublicationSelect
            no-button
            :initial-country-code="editSubscription.publicationCode ? editSubscription.publicationCode.split('/')[0] : null"
            :initial-publication-code="editSubscription.publicationCode"
            @input="editSubscription.publicationCode = $event"
          />
        </template>
        <Publication
          v-else-if="publicationNames[publicationCode]"
          :publicationname="publicationNames[publicationCode]"
          :publicationcode="publicationCode"
        />
      </b-col>
      <b-col
        sm="3"
        md="2"
      >
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
          {{ startDate }}
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
          {{ endDate }}
        </template>
      </b-col>
      <b-col
        sm="3"
        md="1"
        class="text-center m-2"
      >
        <b-button
          v-if="isEdit"
          size="sm"
          @click="$emit('edit', editSubscription)"
        >
          {{ $t("OK") }}
        </b-button>
        <b-button
          v-else
          size="sm"
          @click="$emit('start-edit')"
        >
          {{ $t("Modifier") }}
        </b-button>
      </b-col>
      <b-col
        sm="3"
        md="1"
        class="text-center m-2"
      >
        <b-button
          v-if="isEdit"
          size="sm"
          @click="$emit('cancel-edit')"
        >
          {{ $t("Annuler") }}
        </b-button>
        <b-button
          v-else
          size="sm"
          @click="$emit('delete')"
        >
          {{ $t("Supprimer") }}
        </b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import Publication from "./Publication";
import PublicationSelect from "./PublicationSelect";
import subscriptionMixin from "../mixins/subscriptionMixin";
import { mapState } from "pinia";
import {BButton, BCol, BForm, BRow} from "bootstrap-vue-3";
import { coa } from "../stores/coa";

export default {
  name: "Subscription",

  components: {
    PublicationSelect,
    Publication,
    BForm,
    BRow,
    BCol,
    BButton,

  },
  mixins: [subscriptionMixin],

  props: {
    id: {
      default: null,
      type: Number
    },
    isEdit: {
      required: true,
      type: Boolean
    },
    publicationCode: {
      default: null,
      type: String
    },
    startDate: {
      default: null,
      type: String
    },
    endDate: {
      default: null,
      type: String
    }
  },
  emits: ['delete', 'edit', 'start-edit', 'cancel-edit'],

  setup(props) {
    return {
      editSubscription: {
          publicationCode: props.publicationCode,
          startDate: props.startDate,
          endDate: props.endDate
      },
      editedSubscriptionId: null,
      ...mapState(coa, ["countryNames", "publicationNames"])
    }
  }
};
</script>

<style scoped>

</style>
