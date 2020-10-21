<template>
  <div v-if="l10n">
    <div v-if="isSharedBookcase">
      <!--      Added edges-->
    </div>
    {{ 1 }}{{ l10n.POURCENTAGE_COLLECTION_VISIBLE }}
    <div v-if="loading">
      {{ l10n.CHARGEMENT }}
    </div>
    <div v-else>
      <div v-if="!isSharedBookcase">
        <!--        Edge photo suggestion-->
        <div class="issue-title">
          <span class="nowrap">
            <img class="flag">&nbsp;
          </span>
          <span class="publication_name" />
          <span class="issuenumber" />
        </div>
        <!--        Edge photo suggestion-->
        <IssueSearch />
        <div id="bookcase" />
      </div>
    </div>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import IssueSearch from "../components/IssueSearch";
import {mapActions, mapGetters, mapState} from "vuex";
import collectionMixin from "../mixins/collectionMixin";

export default {
  name: "Bookcase",
  components: {IssueSearch},
  mixins: [l10nMixin, collectionMixin],

  data: () => ({
    loading: true,
    isSharedBookcase: false,
    edgesUsingSprites: null
  }),

  computed: {
    ...mapState("collection", ["bookcase", "bookcaseOrder"]),
    ...mapGetters("collection", ["totalPerPublication"]),
    ...mapState("coa", ["publicationNames", "issueNumbers"])
  },

  watch: {
    totalPerPublication: {
      immediate: true,
      async handler(newValue) {
        const vm = this
        if (newValue) {
          await this.fetchPublicationNames(Object.keys(newValue))
          await this.fetchIssueNumbers(Object.keys(newValue).filter(publicationCode =>
            vm.collection.filter(({publicationCode: issuePublicationCode, issueNumber}) =>
              issuePublicationCode === publicationCode && !/^[0-9]$/.test(issueNumber)).length
          ))
        }
      }
    },
    issueNumbers(newValue) {

    },
    bookcase(newValue) {
      const usedSprites = newValue
        .filter(({Sprites}) => Sprites)
        .reduce((acc, {EdgeID, Sprites}) => {
          JSON.parse(`[${Sprites}]`).forEach((sprite) => {
            const {name} = sprite
            if (!acc[name]) {
              acc[name] = {edges: [], ...sprite}
            }
            acc[name].edges.push(EdgeID)
          })
          return acc
        }, {})

      this.edgesUsingSprites = Object.values(usedSprites)
        .filter(({edges, size}) => edges.length >= size * 80 / 100)
        .sort(({size: aSize}, {size: bSize}) => Math.sign(aSize - bSize))
        .reduce((acc, {name, version, edges}) => {
          edges.forEach(edgeId => {
            acc[edgeId] = {name, version}
          })
          return acc
        }, {})
    }
  },

  async mounted() {
    await this.loadBookcase()
    await this.loadBookcaseOrder()

  },

  methods: {
    ...mapActions("collection", ["loadBookcase", "loadBookcaseOrder"]),
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueNumbers"])
  }
}
</script>

<style scoped lang="scss">
#bookcase {
  height: 100%;
  overflow: hidden;
  margin-top: 35px;
  padding: 10px 5px 10px 15px;
  background: transparent repeat left top;
  clear: both;
}
</style>