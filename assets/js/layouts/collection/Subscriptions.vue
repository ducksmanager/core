<template>
  <div v-if="subscriptions && hasPublicationNames">
    <b-alert
      variant="info"
      show
    >
      {{ $t('Indiquez les magazines auxquels vous êtes abonné. DucksManager les ajoutera automatiquement à votre collection à leur sortie.') }}
    </b-alert>
    <b-row>
      <b-col
        sm="8"
        md="4"
      >
        <h4>{{ $t('Mes abonnements') }}</h4>
      </b-col>
    </b-row>
    <div v-if="!subscriptions.length">
      {{ $t('Aucun abonnement') }}
    </div>
    <b-alert
      v-for="(currentAssociatedPublication, idx) in currentAssociatedPublications"
      :key="`associated-pub-${JSON.stringify(currentAssociatedPublication)}`"
      show
      variant="info"
    >
      {{ $t('Vous avez indiqué avoir un abonnement pour {0}. Généralement, cet abonnement inclut également la réception du magazine {1}. Voulez-vous ajouter un abonnement à {1} pour les mêmes dates ?', [publicationNames[currentAssociatedPublication.referencePublicationcode], publicationNames[currentAssociatedPublication.publicationcode], publicationNames[currentAssociatedPublication.publicationcode]]) }}
      <p>
        <b-btn @click="createAssociatedPublicationSubscription(subscriptions.find(({publicationCode}) => publicationCode === currentAssociatedPublication.referencePublicationcode), currentAssociatedPublication)">
          {{ $t('Oui') }}
        </b-btn>
        <b-btn @click="currentAssociatedPublications.splice(idx, 1)">
          {{ $t('Non') }}
        </b-btn>
      </p>
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
        {{ $t('du') }} {{ subscription.startDate }} {{ $t('au') }} {{ subscription.endDate }}
      </b-col>
      <b-col
        sm="4"
        md="2"
      >
        <b-btn
          size="sm"
          @click="deleteSubscription(subscription.id)"
        >
          {{ $t('Supprimer') }}
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
          <h4>{{ $t('Ajouter un abonnement') }}</h4>
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
          {{ $t('du') }} <input
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
          {{ $t('au') }} <input
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
        {{ $t('Ajouter') }}
      </b-btn>
    </b-form>
  </div>
  <div v-else>
    {{ $t('Chargement...') }}
  </div>
</template>
<script>
import {mapActions, mapState} from "vuex";
import l10nMixin from "../../mixins/l10nMixin";
import PublicationSelect from "../../components/PublicationSelect";
import axios from "axios";
import Publication from "../../components/Publication";
import subscriptionMixin from "../../mixins/subscriptionMixin";

export default {
  name: "Subscriptions",
  components: {Publication, PublicationSelect},
  mixins: [l10nMixin, subscriptionMixin],
  data() {
    return {
      hasPublicationNames: false,
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
      async handler(newValue) {
        if (newValue) {
          this.currentAssociatedPublications = this.associatedPublications
            .filter(({ referencePublicationcode, publicationcode: associatedPublicationcode }) =>
              newValue.find(({ publicationCode }) => referencePublicationcode === publicationCode)
              && !newValue.find(({ publicationCode }) => associatedPublicationcode === publicationCode))
          await this.fetchPublicationNames([
            ...this.associatedPublications.map(({ publicationcode }) => publicationcode),
            ...this.subscriptions.map(({ publicationCode }) => publicationCode)]
          )
          this.hasPublicationNames = true
        }
      }
    }
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),

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
