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
    <b-alert
      v-for="(currentAssociatedPublication, idx) in currentAssociatedPublications"
      :key="`associated-pub-${JSON.stringify(currentAssociatedPublication)}`"
      show
      variant="info"
    >
      {{ $t('ABONNEMENT_PROPOSITION_ABONNEMENT_ASSOCIE', [publicationNames[currentAssociatedPublication.referencePublicationcode], publicationNames[currentAssociatedPublication.publicationcode], publicationNames[currentAssociatedPublication.publicationcode]]) }}
      <b-btn @click="createAssociatedPublicationSubscription(subscriptions.find(({publicationCode}) => publicationCode === currentAssociatedPublication.referencePublicationcode), currentAssociatedPublication)">
        {{ l10n.OUI }}
      </b-btn>
      <b-btn @click="currentAssociatedPublications.splice(idx, 1)">
        {{ l10n.NON }}
      </b-btn>
    </b-alert>
    <b-row
      v-for="subscription in subscriptions"
      :key="subscription.id"
      class="mt-3 align-items-center"
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
    <b-form
      ref="form"
      method="post"
    >
      <b-row>
        <b-col
          sm="8"
          md="4"
        >
          <h4>{{ l10n.ABONNEMENT_AJOUTER }}</h4>
          <input
            v-if="forcedPublicationcode"
            type="hidden"
            name="publicationCode"
            :value="newSubscription.publicationCode"
          >
          <PublicationSelect
            v-else
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
      currentAssociatedPublications: [],
      newSubscription: {},
      forcedPublicationcode: false,
      associatedPublications: [{
        referencePublicationcode: 'fr/JM',
        publicationcode: 'fr/JMS'
      }]
    }
  },

  computed: {
    ...mapState("coa", ["countryNames", "publicationNames"])
  },

  watch: {
    subscriptions: {
      immediate: true,
      handler(newValue) {
        this.currentAssociatedPublications = newValue && this.associatedPublications
          .filter(({referencePublicationcode, publicationcode: associatedPublicationcode}) =>
            newValue.find(({ publicationCode }) => referencePublicationcode === publicationCode)
            && !newValue.find(({ publicationCode }) => associatedPublicationcode === publicationCode))
      }
    }
  },

  async mounted() {
    await this.loadSubscriptions()
    await this.fetchPublicationNames([
      ...this.associatedPublications.map(({publicationcode}) => publicationcode),
      ...this.subscriptions.map(({publicationCode}) => publicationCode)]
    )
    this.hasPublicationNames = true
  },
  methods: {
    ...mapActions("collection", ["fetchSubscriptions"]),
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),

    async loadSubscriptions() {
      this.subscriptions = (await axios.get(`/api/collection/subscriptions`)).data
    },

    createAssociatedPublicationSubscription(existingSubscription, { publicationcode: associatedPublicationcode }) {
      this.newSubscription = {
        ...existingSubscription,
        publicationCode: associatedPublicationcode,
      }
      this.forcedPublicationcode = true
      this.$nextTick(function() {
        this.$refs.form.submit()
      })
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
