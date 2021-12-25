<template>
  <div v-if="hasData">
    <div
      v-for="mostWantedIssue in mostWanted"
      :key="`wanted-${mostWantedIssue.publicationcode}-${mostWantedIssue.issuenumber}`"
    >
      <div>
        <u>{{ mostWantedIssue.numberOfIssues }} utilisateurs possèdent le numéro :</u>
      </div>&nbsp;
      <img :src="`${imagePath}/flags/${mostWantedIssue.country}.png`">
      {{ publicationNames[mostWantedIssue.publicationcode] }} n°{{ mostWantedIssue.issuenumber }}
    </div>
    <div v-if="publishedEdges && Object.keys(inducksIssueNumbersNoSpace).length">
      <div
        v-for="(issuenumbers, publicationCode) in publishedEdges"
        :key="publicationCode"
        class="publication"
      >
        <b-icon-eye-fill
          v-if="!showEdgesForPublication.includes(publicationCode)"
          @click="showEdgesForPublication.push(publicationCode)"
        />
        <b-icon-eye-slash-fill
          v-else
          @click="showEdgesForPublication.splice(showEdgesForPublication.indexOf(publicationCode), 1)"
        />
        <Publication
          :publicationcode="publicationCode"
          :publicationname="publicationNames[publicationCode]"
        />
        <div v-if="inducksIssueNumbersNoSpace[publicationCode]">
          <Bookcase
            v-if="showEdgesForPublication.includes(publicationCode)"
            :bookcase-textures="bookcaseTextures"
            :sorted-bookcase="inducksIssueNumbersNoSpace[publicationCode].map(issueNumber => ({
              id: `${publicationCode.replace('/', '-')} ${issueNumber}`,
              edgeId: issuenumbers.includes(issueNumber) ? 1 : null,
              publicationCode,
              issueNumber,
            }))"
          />
          <span
            v-for="inducksIssueNumber in inducksIssueNumbersNoSpace[publicationCode]"
            v-else
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
  </div>
  <div v-else>
    {{ $t('Chargement...') }}
  </div>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import axios from "axios";
import {mapActions, mapState} from "pinia";
import Publication from "../../components/Publication";
import Bookcase from "../../components/Bookcase";
import {BIconEyeFill, BIconEyeSlashFill} from "bootstrap-vue";
import { coa } from "../../stores/coa";

export default {
  name: "EdgeProgress",
  components: { Bookcase, Publication, BIconEyeFill, BIconEyeSlashFill },
  mixins: [l10nMixin],
  data() {
    return {
      hasData: false,
      show: false,
      mostWanted: null,
      publishedEdges: null,
      showEdgesForPublication: [],
      bookcaseTextures: { bookcase: "bois/HONDURAS MAHOGANY", bookshelf: "bois/KNOTTY PINE" }
    }
  },
  computed: {
    ...mapState(coa, ["publicationNames", "issueNumbers"]),
    inducksIssueNumbersNoSpace() {
      const vm = this
      return Object.keys(this.issueNumbers).reduce((acc, publicationCode) => ({
        ...acc,
        [publicationCode]: vm.issueNumbers[publicationCode].map(issueNumber => issueNumber.replace(/ /g, ''))
      }), {})
    }
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
    ...mapActions(coa, ["fetchPublicationNames", "fetchIssueNumbers"]),
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

.bi-eye-fill {
  cursor: pointer;
}

.num {
  width: 4px;
  cursor: default;
  background-color: red;

  .available {
    cursor: pointer;
  }
}

.available {
  background-color: green !important;
}

.bordered {
  border-right: 1px solid black;
}
</style>
