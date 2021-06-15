<template>
  <div v-if="hasData">
    <div
      v-for="mostWantedIssue in mostWanted"
      :key="`wanted-${mostWantedIssue.publicationcode}-${mostWantedIssue.Numero}`"
    >
      <div>
        <u>{{ mostWantedIssue.numberOfIssues }} utilisateurs possèdent le numéro :</u>
      </div>&nbsp;
      <img :src="`${imagePath}/flags/${mostWantedIssue.country}.png`">
      {{ publicationNames[mostWantedIssue.publicationcode] }} n°{{ mostWantedIssue.Numero }}
    </div>
    <div v-if="publishedEdges && Object.keys(inducksIssueNumbers).length">
      <div
        v-for="(issuenumbers, publicationCode) in publishedEdges"
        :key="publicationCode"
        class="publication"
      >
        <span>
          (<img :src="`${imagePath}/flags/${publicationCode.split('/')[0]}.png`"> {{
            publicationCode.split('/')[1]
          }})
          {{ publicationNames[publicationCode] }}
        </span>
        <div v-if="inducksIssueNumbers[publicationCode]">
          <span
            v-for="inducksIssueNumber in inducksIssueNumbers[publicationCode]"
            :key="`${publicationCode}-${inducksIssueNumber}`"
          >
            <span
              v-if="!issuenumbers.includes(inducksIssueNumber)"
              class="num bordered"
              :title="inducksIssueNumber"
            >&nbsp;</span>
            <span
              v-else-if="!show"
              class="num bordered available"
              :title="inducksIssueNumber"
              @click="open(publicationCode, inducksIssueNumber)"
            >&nbsp;</span>
            <img
              v-else
              :src="getEdgeUrl(publicationCode, inducksIssueNumber)"
            >
          </span>
        </div>
        <div v-else>
          Certaines tranches de cette publication sont prêtes mais la publication n'existe plus sur Inducks :
          {{ issuenumbers.join(', ') }}
        </div>
      </div>
      <br><br>
      <b>{{
        Object.keys(publishedEdges).reduce((acc, publicationCode) => acc + publishedEdges[publicationCode].length, 0)
      }} tranches prêtes.</b><br>
      <br><br>
      <u>Légende : </u><br>
      <span class="num">&nbsp;</span> Nous avons besoin d'une photo de cette tranche !<br>
      <span class="num available">&nbsp;</span> Cette tranche est prête.<br>
    </div>
    <div v-else>
      {{ $t('Chargement...') }}
    </div>
  </div>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import axios from "axios";
import {mapActions, mapState} from "vuex";

export default {
  name: "EdgeProgress",
  mixins: [l10nMixin],
  data() {
    return {
      hasData: false,
      show: false,
      mostWanted: null,
      publishedEdges: null,
    }
  },
  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapState("coa", {"inducksIssueNumbers": "issueNumbers"}),
  },
  async mounted() {
    this.mostWanted = (await axios.get("/admin/edges/wanted/data")).data.map(mostWantedIssue => ({
      ...mostWantedIssue,
      country: mostWantedIssue.publicationcode.split('/')[0],
      magazine: mostWantedIssue.publicationcode.split('/')[1],
    }))

    this.publishedEdges = (await axios.get("/admin/edges/published/data")).data.reduce((acc, value) => ({
      ...acc,
      [value.publicationcode]: [...acc[value.publicationcode] || [], value.issuenumber]
    }), {})

    await this.fetchPublicationNames([
        ...this.mostWanted.map(mostWantedIssue => mostWantedIssue.publicationcode),
        ...Object.keys(this.publishedEdges)
    ])

    await this.fetchIssueNumbers(Object.keys(this.publishedEdges))
    this.hasData = true
  },
  methods: {
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueNumbers"]),
    getEdgeUrl(publicationCode, issueNumber) {
      const [country, magazine] = publicationCode.split('/')
      return `https://edges.ducksmanager.net/edges/${country}/gen/${magazine}.${issueNumber}.png`
    },
    open(publicationCode, issueNumber) {
      window.open(this.getEdgeUrl(publicationCode, issueNumber), '_blank')
    }
  }
}
</script>

<style scoped lang="scss">
.publication {
  margin-top: 20px;
}

.num {
  width: 4px;
  cursor: default;
  background-color: red;
}

#num_courant {
  background-color: red;
}

.available {
  background-color: green !important;
}

.num.available {
  cursor: pointer;
}

.bordered {
  border-right: 1px solid black;
}

#num_courant {
  position: fixed;
  top: 0;
  left: 90%;
  width: 10%;
  border: 1px solid black;
  text-align: center;

  &.init {
    background-color: white !important;
  }
}
</style>
