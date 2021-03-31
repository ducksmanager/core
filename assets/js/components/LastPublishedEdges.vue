<template>
  <Accordion
    v-if="publishedEdgesSincePreviousVisit && publishedEdgesSincePreviousVisit.length && hasPublicationNames"
    id="last-published-edges"
    accordion-group-id="last-published-edges"
  >
    <template #header>
      <div
        v-html="$t(publishedEdgesSincePreviousVisit.length > 1
                     ? 'BIBLIOTHEQUE_NOUVELLES_TRANCHES_TITRE'
                     : 'BIBLIOTHEQUE_NOUVELLE_TRANCHE_TITRE',
                   [publishedEdgesSincePreviousVisit.length])"
      />
    </template>
    <template #content>
      <div
        v-for="edge in publishedEdgesSincePreviousVisit"
        :key="`last-published-${edge.id}`"
      >
        <Issue
          :publicationcode="edge.publicationcode"
          :publicationname="publicationNames[edge.publicationcode]"
          :issuenumber="edge.issuenumber"
          hide-condition
        >
          <Ago :timestamp="edge.timestamp" />
        </Issue>
      </div>
    </template>
    <template #footer>
      <div
        v-html="$t(publishedEdgesSincePreviousVisit.length > 1
          ? 'Accédez à <a href=\'/bookcase\'>votre bibliothèque</a> pour les voir.'
          : 'Accédez à <a href=\'/bookcase\'>votre bibliothèque</a> pour la voir.')"
      />
    </template>
  </Accordion>
</template>
<script>
import Accordion from "./Accordion";
import Issue from "./Issue";
import Ago from "./Ago";
import {mapActions, mapState} from "vuex";
import l10nMixin from "../mixins/l10nMixin";
import collectionMixin from "../mixins/collectionMixin";

export default {
  name: "LastPublishedEdges",
  components: {Ago, Issue, Accordion},
  mixins: [l10nMixin, collectionMixin],
  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapState("collection", ["previousVisit", "lastPublishedEdgesForCurrentUser"]),

    publishedEdgesSincePreviousVisit() {
      const vm = this
      return this.lastPublishedEdgesForCurrentUser && this.lastPublishedEdgesForCurrentUser.filter(({creationDate}) => creationDate >= vm.previousVisit)
    },

    hasPublicationNames() {
      const vm = this
      return this.publishedEdgesSincePreviousVisit && this.publishedEdgesSincePreviousVisit.every(({publicationcode}) => vm.publicationNames[publicationcode])
    }
  },

  async mounted() {
    await this.loadLastPublishedEdgesForCurrentUser()
  },

  methods: {
    ...mapActions("collection", ["loadLastPublishedEdgesForCurrentUser"])
  }
}
</script>

<style scoped>

</style>
