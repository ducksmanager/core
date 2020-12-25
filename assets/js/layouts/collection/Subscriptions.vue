<template>
  <div v-if="subscriptions && hasPublicationNames">
    <b-alert
      variant="info"
      show
    >
      {{ l10n.ABONNEMENT_EXPLICATION }}
    </b-alert>
    <b-row>
      <b-col
        sm="8"
        md="4"
      >
        <h4>{{ l10n.ABONNEMENT_TITRE }}</h4>
      </b-col>
    </b-row>
    <div v-if="!subscriptions.length">
      {{ l10n.ABONNEMENT_AUCUN }}
    </div>
    <b-row
      v-for="subscription in subscriptions"
      :key="subscription.id"
    >
      <b-col
        sm="4"
        md="2"
      >
        <Publication
          v-if="publicationNames[subscription.publicationCode]"
          :publicationname="publicationNames[subscription.publicationCode]"
          :publicationcode="subscription.publicationCode"
        />
      </b-col>
      <b-col
        sm="4"
        md="2"
      >
        {{ l10n.DU }} {{ subscription.startDate }} {{ l10n.AU }} {{ subscription.endDate }}
      </b-col>
      <b-col
        sm="4"
        md="2"
      >
        <b-btn
          size="sm"
          @click="deleteSubscription(subscription.id)"
        >
          {{ l10n.SUPPRIMER }}
        </b-btn>
      </b-col>
    </b-row>
    <br>
    <b-form method="post">
      <b-row>
        <b-col
          sm="8"
          md="4"
        >
          <h4>{{ l10n.ABONNEMENT_AJOUTER }}</h4>
          <PublicationSelect
            no-button
            @input="newSubscription = {...newSubscription, publicationCode: $event}"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col
          sm="4"
          md="2"
        >
          {{ l10n.DU }} <input
            v-model="newSubscription.startDate"
            name="startDate"
            required
            class="form-control"
            type="date"
          >
        </b-col>
        <b-col
          sm="4"
          md="2"
        >
          {{ l10n.AU }} <input
            v-model="newSubscription.endDate"
            name="endDate"
            required
            class="form-control"
            type="date"
          >
        </b-col>
      </b-row>
      <b-btn
        variant="success"
        type="submit"
        :disabled="!newSubscription.publicationCode"
      >
        {{ l10n.AJOUTER }}
      </b-btn>
    </b-form>
  </div>
  <div v-else>
    {{ l10n.CHARGEMENT }}
  </div>
</template>
<script>
import {mapActions, mapState} from "vuex";
import l10nMixin from "../../mixins/l10nMixin";
import PublicationSelect from "../../components/PublicationSelect";
import axios from "axios";
import Publication from "../../components/Publication";

export default {
  name: "Subscriptions",
  components: {Publication, PublicationSelect},
  mixins: [l10nMixin],
  data() {
    return {
      hasPublicationNames: false,
      subscriptions: null,
      newSubscription: {}
    }
  },

  computed: {
    ...mapState("coa", ["countryNames", "publicationNames"])
  },

  async mounted() {
    await this.loadSubscriptions()
    await this.fetchPublicationNames(this.subscriptions.map(({publicationCode}) => publicationCode))
    this.hasPublicationNames = true
  },
  methods: {
    ...mapActions("collection", ["fetchSubscriptions"]),
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),

    async loadSubscriptions() {
      this.subscriptions = (await axios.get(`/api/collection/subscriptions`)).data
    },

    async deleteSubscription(id) {
      (await axios.delete(`/api/collection/subscriptions/${id}`)).data
      await this.loadSubscriptions()
    }
  }
}
</script>
<style scoped>
</style>
