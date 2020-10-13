<template>
  <div>
    <div id="intro">
      {{ l10n.POSSESSION_MAGAZINES_INTRO }} $nb_numeros {{ l10n.NUMEROS }}<br>
      {{ l10n.POSSESSION_MAGAZINES_2 }} $nb_magazines {{ l10n.POSSESSION_MAGAZINES_3 }}
      $nb_pays {{ l10n.PAYS }}
      <br>{{ l10n.CLIQUEZ_SUR_MAGAZINE_POUR_EDITER }}<br><br>
    </div>
    <IssueList :publicationcode="publicationcode" />
  </div>
</template>

<script>
import IssueList from "../components/IssueList";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Manage",
  components: {
    IssueList
  },
  mixins: [l10nMixin],
  props: {
    publicationcode: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>

</style>