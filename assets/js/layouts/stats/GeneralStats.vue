<template>
  <div>
    <ShortStats
      v-if="rarityTotal"
      id="short-stats"
    >
      <template #non-empty-collection>
        <div>
          <span
            v-html="$t('Le contenu de votre collection est <b>n°{0} / {1}</b> en terme de rareté sur DucksManager.', [rarityValue, rarityTotal])"
          /><br>
          <small
            class="d-inline-block mt-3"
          >{{ $t("La rareté de votre collection est calculée sur la base du nombre d'autres utilisateurs qui possèdent chacun des magazines de votre collection.")
          }}</small>
        </div>
      </template>
    </ShortStats>
    <div v-else>
      {{ $t("Chargement...") }}
    </div>
    <h2>{{ $t("Valeur de la collection") }}<sup><small>{{ $t("Nouveau!") }}</small></sup></h2>
    <template v-if="quotedIssues && hasPublicationNames">
      <b-alert
        v-if="quotationSum === 0"
        show
        variant="light"
      >
        {{ $t("Votre collection ne contient pas de magazines cotés.") }}
      </b-alert>
      <div v-else>
        <div
          class="my-3"
          v-html="$t('La valeur de votre collection est estimée à : {0}.', [$t('Plus de {0} {1}', [quotationSum, '€'])])"
        />
        <Accordion
          id="quotation-details"
          accordion-group-id="quotation-details"
          :visible="false"
        >
          <template #header>
            {{ $t("Détails") }}
          </template>
          <template #content>
            <div class="my-3">
              {{ $t("Votre collection contient {0} magazines cotés.", [quotedIssues.length]) }}
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
                {{ getConditionLabel(item.condition) }}
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
            {{ $t("Comment DucksManager calcule-t-il la valeur de ma collection ?") }}
          </template>
          <template #content>
            <div>
              {{ $t("Si certains des magazines de votre collection sont cotés, DucksManager peut en calculer la valeur approximative.")
              }}
            </div>
            <div
              v-html="$t('Les cotes utilisées sont celles référencées sur le site Internet {0}.', [`<a href='https://bedetheque.com'>Bédéthèque</a>`])"
            />
            {{ $t("Ces cotes sont ensuite ajustées en fonction des états que vous spécifiez pour chacun des numéros, selon le barème suivant :")
            }}
            <ul>
              <li>{{ $t("Numéro en bon état : pas d'ajustement") }}</li>
              <li>{{ $t("Numéro en moyen état : 70% de la cote") }}</li>
              <li>{{ $t("Numéro en mauvais état : 30% de la cote") }}</li>
              <li>{{ $t("Etat non défini : 70% de la cote") }}</li>
            </ul>
            <div
              v-html="$t(`Une cote présente sur Bédéthèque n'est pas incluse dans la valeur de votre collection calculée par DucksManager ? Faites-le nous savoir en envoyant un e-mail à {0} :-)`, [`<a href='mailto:admin@ducksmanager.net'>admin@ducksmanager.net</a>`])"
            />
          </template>
        </Accordion>
      </div>
    </template>
    <div v-else>
      {{ $t("Chargement...") }}
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
    currentPage: 1
  }),

  computed: {
    ...mapState("users", ["count"]),
    ...mapState("coa", ["publicationNames"]),
    ...mapGetters("collection", ["totalPerPublication", "quotedIssues", "quotationSum"]),
    quotationFields() {
      return [
        { key: "issue", label: this.ucFirst(this.$t("numéro")) },
        { key: "condition", label: this.ucFirst(this.$t("Etat")) },
        { key: "estimation", label: this.ucFirst(this.$t("Estimation")) },
        { key: "estimationGivenCondition", label: this.ucFirst(this.$t("Estimation ajustée de l'état")) }
      ];
    }
  },

  watch: {
    totalPerPublication: {
      immediate: true,
      async handler() {
        await this.fetchIssueQuotations(Object.keys(this.totalPerPublication));
      }
    },
    async quotedIssues(newValue) {
      await this.fetchPublicationNames(newValue.map(({ publicationCode }) => publicationCode));
      this.hasPublicationNames = true;
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
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueQuotations"])
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
