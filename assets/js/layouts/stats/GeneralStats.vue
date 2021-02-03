<template>
  <div>
    <ShortStats
      v-if="rarityTotal"
      id="short-stats"
    >
      <template #non-empty-collection>
        <div>
          <span v-html="$t('RARETE_TEXTE', [rarityValue, rarityTotal])" /><br>
          <small class="d-inline-block mt-3">{{ l10n.RARETE_EXPLICATION }}</small>
        </div>
      </template>
    </ShortStats>
    <div v-else>
      {{ l10n.CHARGEMENT }}
    </div>
    <h2>{{ l10n.VALEUR_COLLECTION }}<sup><small>{{ l10n.NOUVEAU }}</small></sup></h2>
    <template v-if="quotedIssues && hasPublicationNames">
      <b-alert
        v-if="quotationSum === 0"
        show
        variant="light"
      >
        {{ l10n.VALEUR_COLLECTION_AUCUN_MAGAZINE_COTE }}
      </b-alert>
      <div v-else>
        <div
          class="my-3"
          v-html="$t('VALEUR_COLLECTION_ESTIMATION', [$t('PLUS_DE', [quotationSum, '€'])])"
        />
        <Accordion
          id="quotation-details"
          accordion-group-id="quotation-details"
          :visible="false"
        >
          <template #header>
            {{ l10n.DETAILS }}
          </template>
          <template #content>
            <div class="my-3">
              {{ $t('VALEUR_COLLECTION_NOMBRE_MAGAZINES_COTES', [quotedIssues.length]) }}
            </div>
            <b-table
              striped
              :items="quotedIssues"
              sort-by="estimationGivenCondition"
              sort-desc
              :per-page="50"
              :current-page="currentPage"
              :fields="quotationFields"
            >
              <template #cell(issue)="{item}">
                <Issue
                  :publicationcode="item.publicationCode"
                  :publicationname="publicationNames[item.publicationCode]"
                  :issuenumber="item.issueNumber"
                />
              </template>
              <template #cell(condition)="{item}">
                {{ l10n[`ETAT_${item.condition.toUpperCase()}`] }}
              </template>
              <template #cell(estimation)="{item}">
                {{ item.estimation }}€
              </template>
              <template #cell(estimationGivenCondition)="{item}">
                {{ item.estimationGivenCondition }}€
              </template>
            </b-table>
          </template>
        </Accordion>
        <Accordion
          id="quotation-explanation"
          accordion-group-id="quotation-explanation"
          :visible="false"
        >
          <template #header>
            {{ l10n.VALEUR_COLLECTION_EXPLICATION_TITRE }}
          </template>
          <template #content>
            <div>
              {{ l10n.VALEUR_COLLECTION_EXPLICATION_CONTENU_1 }}
            </div>
            <div v-html="$t('VALEUR_COLLECTION_EXPLICATION_CONTENU_2', ['<a href=\'https://bedetheque.com\'>Bédéthèque</a>'])" />
            {{ l10n.VALEUR_COLLECTION_EXPLICATION_CONTENU_3 }}
            <ul>
              <li>{{ l10n.VALEUR_COLLECTION_EXPLICATION_CONTENU_BAREME_BON }}</li>
              <li>{{ l10n.VALEUR_COLLECTION_EXPLICATION_CONTENU_BAREME_MOYEN }}</li>
              <li>{{ l10n.VALEUR_COLLECTION_EXPLICATION_CONTENU_BAREME_MAUVAIS }}</li>
              <li>{{ l10n.VALEUR_COLLECTION_EXPLICATION_CONTENU_BAREME_INDEFINI }}</li>
            </ul>
            <div v-html="$t('VALEUR_COLLECTION_EXPLICATION_CONTENU_4', ['<a href=\'mailto:admin@ducksmanager.net\'>admin@ducksmanager.net</a>'])" />
          </template>
        </Accordion>
      </div>
    </template>
    <div v-else>
      {{ l10n.CHARGEMENT }}
    </div>
  </div>
</template>

<script>
import ShortStats from "../../components/ShortStats";
import axios from "axios";
import l10nMixin from "../../mixins/l10nMixin";
import { mapActions, mapGetters, mapState } from "vuex";
import Accordion from "../../components/Accordion";
import Issue from "../../components/Issue";
import conditionMixin from "../../mixins/conditionMixin";

export default {
  name: "GeneralStats",
  components: { Issue, Accordion, ShortStats },
  mixins: [l10nMixin, conditionMixin],

  data: () => ({
    rarityValue: null,
    rarityTotal: null,
    hasPublicationNames: false,
    currentPage: 1,
  }),

  computed: {
    ...mapState("users", ["count"]),
    ...mapState("coa", ["publicationNames"]),
    ...mapGetters("collection", ["totalPerPublication", "quotedIssues", "quotationSum"]),
    quotationFields() {
      return [
        {key: 'issue', label: this.ucFirst(this.$t('NUMERO'))},
        {key: 'condition', label: this.ucFirst(this.$t('ETAT'))},
        {key: 'estimation', label: this.ucFirst(this.$t('ESTIMATION'))},
        {key: 'estimationGivenCondition', label: this.ucFirst(this.$t('ESTIMATION_AJUSTEE'))}
      ]
    }
  },

  watch: {
    totalPerPublication: {
      immediate: true,
      async handler() {
        await this.fetchIssueQuotations(Object.keys(this.totalPerPublication))
      }
    },
    async quotedIssues(newValue) {
        await this.fetchPublicationNames(newValue.map(({publicationCode}) => publicationCode))
        this.hasPublicationNames = true
      }
  },

  async mounted() {
    await this.fetchCount();
    const { userScores, myScore } = (await axios.get(`/global-stats/user/collection/rarity`)).data;
    this.rarityValue = userScores.length - userScores.indexOf(myScore);
    this.rarityTotal = this.count;
  },

  methods: {
    ...mapActions("users", ["fetchCount"]),
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueQuotations"]),
  }
};
</script>

<style scoped lang="scss">
::v-deep div {
  font-size: 16px;
}
#short-stats ::v-deep div {
  margin-bottom: 32px;
}
.card {
  color: black;

  ::v-deep td, ::v-deep div {
    line-height: 30px;
  }
}
</style>
