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
        <b-btn
          v-if="isEdit"
          size="sm"
          @click="$emit('edit', editSubscription)"
        >
          {{ $t("OK") }}
        </b-btn>
        <b-btn
          v-else
          size="sm"
          @click="$emit('start-edit')"
        >
          {{ $t("Modifier") }}
        </b-btn>
      </b-col>
      <b-col
        sm="3"
        md="1"
        class="text-center m-2"
      >
        <b-btn
          v-if="isEdit"
          size="sm"
          @click="$emit('cancel-edit')"
        >
          {{ $t("Annuler") }}
        </b-btn>
        <b-btn
          v-else
          size="sm"
          @click="$emit('delete')"
        >
          {{ $t("Supprimer") }}
        </b-btn>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import Publication from "./Publication";
import PublicationSelect from "./PublicationSelect";
import l10nMixin from "../mixins/l10nMixin";
import subscriptionMixin from "../mixins/subscriptionMixin";
import { mapState } from "vuex";

export default {
  name: "Subscription",

  components: {
    PublicationSelect,
    Publication
  },
  mixins: [l10nMixin, subscriptionMixin],
  
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
  
  data() {
    return {
      editSubscription: {
          publicationCode: this.publicationCode,
          startDate: this.startDate,
          endDate: this.endDate
      },
      editedSubscriptionId: null
    }
  },

  computed: {
    ...mapState("coa", ["countryNames", "publicationNames"])
  }
};
</script>

<style scoped>

</style>