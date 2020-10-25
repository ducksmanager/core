<template>
  <div v-if="l10n">
    <div v-if="!isSharedBookcase">
      <!--      Added edges-->
    </div>
    <div v-if="percentVisible !== null">
      {{ percentVisible }}{{ l10n.POURCENTAGE_COLLECTION_VISIBLE }}
    </div>
    <div v-if="loading">
      {{ l10n.CHARGEMENT }}
    </div>
    <div v-else>
      <div v-if="!isSharedBookcase">
        <div v-if="popularIssuesInCollectionWithoutEdge && popularIssuesInCollectionWithoutEdge.length && userPoints">
          {{ $t('INVITATION_ENVOI_PHOTOS_TRANCHES', [popularIssuesInCollectionWithoutEdge[0].popularity]) }}
          <div>
            <b-carousel
              controls
              indicators
              img-width="1024"
              img-height="480"
            >
              <b-carousel-slide
                v-for="popularIssueWithoutEdge in popularIssuesInCollectionWithoutEdge"
                :key="popularIssueWithoutEdge.issueCode"
              >
                <Issue
                  :publicationcode="popularIssueWithoutEdge.publicationCode"
                  :publicationname="publicationNames[popularIssueWithoutEdge.publicationCode]"
                  :issuenumber="popularIssueWithoutEdge.Numero"
                  hide-condition
                />
                <MedalProgress
                  contribution="Photographe"
                  :user-level-points="userPoints.Photographe"
                  :extra-points="popularIssueWithoutEdge.popularity"
                />
                <div>
                  <b-btn
                    variant="info"
                    href="https://edgecreator.ducksmanager.net"
                    target="_blank"
                  >
                    {{ l10n.ENVOYER_PHOTOS_DE_TRANCHE }}
                  </b-btn>
                </div>
              </b-carousel-slide>
            </b-carousel>
          </div>
        </div>
        <IssueSearch style="float: right" />
      </div>
      <div
        id="bookcase"
        :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
      >
        <Edge
          v-for="(edge, edgeIndex) in sortedBookcase"
          :key="getEdgeKey(edge)"
          :publication-code="`${edge.Pays}/${edge.Magazine}`"
          :issue-number="edge.Numero"
          :issue-number-reference="edge.NumeroReference"
          :existing="!!edge.EdgeID"
          :sprite-path="edgesUsingSprites[edge.EdgeID] || null"
          :load="currentEdgeIndex >= edgeIndex"
          @loaded="currentEdgeIndex++"
        />
      </div>
    </div>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import IssueSearch from "../components/IssueSearch";
import {mapActions, mapGetters, mapState} from "vuex";
import collectionMixin from "../mixins/collectionMixin";
import Edge from "../components/Edge";
import MedalProgress from "../components/MedalProgress";
import Issue from "../components/Issue";
import * as axios from "axios";
import medalMixin from "../mixins/medalMixin";

export default {
  name: "Bookcase",
  components: {MedalProgress, Issue, Edge, IssueSearch},
  mixins: [l10nMixin, collectionMixin],

  data: () => ({
    isSharedBookcase: false,
    edgesUsingSprites: [],
    currentEdgeIndex: 0,
  }),

  computed: {
    ...mapState("collection", ["bookcase", "bookcaseTextures", "bookcaseOrder", "popularIssuesInCollection"]),
    ...mapGetters("collection", ["totalPerPublication", "popularIssuesInCollectionWithoutEdge"]),
    ...mapState("coa", ["publicationNames", "issueNumbers"]),
    ...mapState("users", ["points"]),

    userId: () => window.userId,
    imagePath: () => window.imagePath,

    loading() {
      return !(this.sortedBookcase && this.bookcaseTextures && this.edgesUsingSprites)
    },

    userPoints() {
      return this.points && this.points[this.userId]
    },

    percentVisible() {
      return this.bookcase && parseInt(100 * this.bookcase.filter(({EdgeID}) => EdgeID).length / this.bookcase.length)
    },

    sortedBookcase() {
      const vm = this
      return this.bookcase && this.bookcaseOrder && this.issueNumbers && ([...this.bookcase]).sort((
        {Pays: countryCode1, Magazine: magazineCode1, Numero: issueNumber1},
        {Pays: countryCode2, Magazine: magazineCode2, Numero: issueNumber2}
      ) => {
        const publicationCode1 = `${countryCode1}/${magazineCode1}`;
        const publicationCode2 = `${countryCode2}/${magazineCode2}`;
        const publicationOrderSign = Math.sign(
          vm.bookcaseOrder.indexOf(publicationCode1)
          - vm.bookcaseOrder.indexOf(publicationCode2)
        )
        return publicationOrderSign || (!vm.issueNumbers[publicationCode1] && -1) || Math.sign(
          vm.issueNumbers[publicationCode1].indexOf(issueNumber1)
          - vm.issueNumbers[publicationCode1].indexOf(issueNumber2)
        )
      })
    }
  },

  watch: {
    bookcaseTextures(newValue) {
      if (newValue) {
        const {bookshelf: bookshelfTexture} = newValue
        const bookshelfTextureUrl = `${imagePath}/textures/${bookshelfTexture}.jpg`
        const style = document.createElement('style');
        style.textContent = `.edge:not(.visible-book)::after { background: url("${bookshelfTextureUrl}");}`;
        document.head.append(style);
      }
    },
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
            acc[edgeId] = `v${version}/${name}`
          })
          return acc
        }, {})
    }
  },

  async mounted() {
    await this.loadBookcase()
    await this.loadBookcaseTextures()

    await this.loadBookcaseOrder()
    await this.loadPopularIssuesInCollection()

    await this.fetchStats([this.userId])
  },

  methods: {
    ...mapActions("collection", ["loadBookcase", "loadBookcaseTextures", "loadBookcaseOrder", "loadPopularIssuesInCollection"]),
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueNumbers"]),
    ...mapActions("users", ["fetchStats"]),

    getEdgeKey: edge => `${edge.Pays}/${edge.Magazine} ${edge.Numero}`
  }
}
</script>

<style lang="scss">
#bookcase {
  height: 100%;
  overflow: hidden;
  margin-top: 35px;
  padding: 10px 5px 10px 15px;
  background: transparent repeat left top;
  clear: both;
}

.carousel {
  width: 300px;
  margin: 15px 0 0;
  
  .carousel-caption {
    position: initial;
  }

  ol.carousel-indicators {
    li {
      width: 5px;
      height: 5px;
      border: 5px solid white;
      border-radius: 8px;
      padding: 0;
      background: white;
    }
  }
}
</style>