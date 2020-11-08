<template>
  <div v-if="l10n">
    <div v-if="!isSharedBookcase">
      <div
        v-if="lastPublishedEdgesForCurrentUser && lastPublishedEdgesForCurrentUser.length"
        id="last-published-edges"
      >
        {{ l10n.BIBLIOTHEQUE_NOUVELLES_TRANCHES_LISTE }}
        <div
          v-for="edge in lastPublishedEdgesForCurrentUser"
          :key="`last-published-${getEdgeKey(edge)}`"
        >
          <Issue
            :publicationcode="edge.publicationcode"
            :publicationname="publicationNames[edge.publicationcode]"
            :issuenumber="edge.issuenumber"
            hide-condition
          >
            <Ago :timestamp="edge.dateajout.timestamp" />
          </Issue>
        </div>
      </div>
      <b-alert
        variant="info"
        show
        v-html="$t('EXPLICATION_ORDRE_MAGAZINES', [`<a href='/bookcase/options'>${l10n.BIBLIOTHEQUE_OPTIONS_COURT}</a>`])"
      />
      <div
        v-if="user && user.isShareEnabled"
        id="share-bookcase-section"
      >
        <b-alert
          variant="info"
          show
          v-html="$t('EXPLICATION_PARTAGE_BIBLIOTHEQUE_ACTIVEE', [`<a href='/collection/account'>${l10n.GESTION_COMPTE_COURT}</a>`])"
        />
        <SharePage
          v-if="showShareButtons"
          :title="`${l10n.BIBLIOTHEQUE_DE} ${bookcaseUsername}`"
          :url="bookcaseUrl"
        />
        <b-btn
          v-if="!showShareButtons"
          size="sm"
          @click="showShareButtons=true"
        >
          {{ l10n.BIBLIOTHEQUE_PROPOSITION_PARTAGE }}
        </b-btn>
      </div>
      <b-alert
        v-else
        show
        variant="warning"
        v-html="$t('EXPLICATION_PARTAGE_BIBLIOTHEQUE_DESACTIVEE', [`<a href='/collection/account'>${l10n.GESTION_COMPTE_COURT}</a>`])"
      />
    </div>
    <div v-if="percentVisible !== null">
      {{ percentVisible }}{{ l10n.POURCENTAGE_COLLECTION_VISIBLE }}
    </div>
    <div v-if="loading">
      {{ l10n.CHARGEMENT }}
    </div>
    <b-alert
      v-else-if="isPrivateBookcase"
      variant="warning"
      show
    >
      {{ l10n.BIBLIOTHEQUE_PRIVEE }}
    </b-alert>
    <div v-else>
      <div v-if="!isSharedBookcase">
        <div
          v-if="mostPopularIssuesInCollectionWithoutEdge && mostPopularIssuesInCollectionWithoutEdge.length && userPoints"
        >
          {{ $t('INVITATION_ENVOI_PHOTOS_TRANCHES', [mostPopularIssuesInCollectionWithoutEdge[0].popularity]) }}
          <div>
            <b-carousel
              controls
              indicators
            >
              <b-carousel-slide
                v-for="popularIssueWithoutEdge in mostPopularIssuesInCollectionWithoutEdge"
                :key="popularIssueWithoutEdge.issueCode"
              >
                <Issue
                  :publicationcode="popularIssueWithoutEdge.publicationCode"
                  :publicationname="publicationNames[popularIssueWithoutEdge.publicationCode]"
                  :issuenumber="popularIssueWithoutEdge.issueNumber"
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
        <IssueSearch
          style="float: right"
          :with-story-link="false"
          @issue-selected="highlightIssue"
        />
      </div>
      <Book
        v-if="currentEdgeOpened"
        :publication-code="currentEdgeOpened.publicationCode"
        :issue-number="currentEdgeOpened.issueNumber"
        @close-book="currentEdgeOpened = null"
      />
      <div
        id="bookcase"
        :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
      >
        <Edge
          v-for="(edge, edgeIndex) in sortedBookcase"
          :ref="`edge-${getEdgeKey(edge)}`"
          :key="getEdgeKey(edge)"
          :invisible="currentEdgeOpened === edge"
          :highlighted="currentEdgeHighlighted === getEdgeKey(edge)"
          :publication-code="edge.publicationCode"
          :issue-number="edge.issueNumber"
          :issue-number-reference="edge.issueNumberReference"
          :creation-date="edge.creationDate"
          :popularity="edge.popularity"
          :existing="!!edge.edgeId"
          :sprite-path="edgesUsingSprites[edge.edgeId] || null"
          :load="currentEdgeIndex >= edgeIndex"
          @loaded="currentEdgeIndex++"
          @open-book="currentEdgeOpened = edge"
        />
      </div>
    </div>
  </div>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import IssueSearch from "../../components/IssueSearch";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import collectionMixin from "../../mixins/collectionMixin";
import Edge from "../../components/Edge";
import MedalProgress from "../../components/MedalProgress";
import Issue from "../../components/Issue";
import Book from "../../components/Book";
import Ago from "../Ago";
import SharePage from "../../components/SharePage";

export default {
  name: "ViewBookcase",
  components: {SharePage, Ago, Book, MedalProgress, Issue, Edge, IssueSearch},
  mixins: [l10nMixin, collectionMixin],

  props: {
    bookcaseUsername: {type: String, required: true}
  },

  data: () => ({
    edgesUsingSprites: [],
    currentEdgeIndex: 0,
    currentEdgeOpened: null,
    currentEdgeHighlighted: null,
    bookStartPosition: null,
    showShareButtons: false
  }),

  computed: {
    ...mapState("bookcase", ["bookcaseTextures", "bookcaseOrder", "isPrivateBookcase"]),
    ...mapState("collection", ["user", "lastPublishedEdgesForCurrentUser"]),
    ...mapGetters("collection", ["totalPerPublication", "popularIssuesInCollectionWithoutEdge"]),
    ...mapState("coa", ["publicationNames", "issueNumbers"]),
    ...mapGetters("bookcase", ["isSharedBookcase"]),
    ...mapGetters("bookcase", {"bookcase": "bookcaseWithPopularities"}),
    ...mapState("users", ["points"]),

    userId: () => window.userId,
    imagePath: () => window.imagePath,

    bookcaseUrl() {
      return !this.isPrivateBookcase && `${window.location.origin}/bookcase/show/${this.username}`
    },

    loading() {
      return !this.isPrivateBookcase && !(this.sortedBookcase && this.bookcaseTextures && this.edgesUsingSprites)
    },

    userPoints() {
      return this.points && this.points[this.userId]
    },

    percentVisible() {
      return this.bookcase && parseInt(100 * this.bookcase.filter(({edgeId}) => edgeId).length / this.bookcase.length)
    },

    mostPopularIssuesInCollectionWithoutEdge() {
      const popularIssuesInCollectionWithoutEdge = this.popularIssuesInCollectionWithoutEdge
      return popularIssuesInCollectionWithoutEdge && popularIssuesInCollectionWithoutEdge
        .sort(({popularity: popularity1}, {popularity: popularity2}) => popularity2 - popularity1)
        .filter((_, index) => index < 10)
    },

    sortedBookcase() {
      const vm = this
      return this.bookcase && this.bookcaseOrder && this.issueNumbers && ([...this.bookcase]).sort((
        {countryCode: countryCode1, magazineCode: magazineCode1, issueNumber: issueNumber1},
        {countryCode: countryCode2, magazineCode: magazineCode2, issueNumber: issueNumber2}
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
    bookcase: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          await this.loadBookcaseTextures()
          await this.loadBookcaseOrder()
          await this.fetchStats([this.userId])

          const usedSprites = newValue
            .filter(({sprites}) => sprites)
            .reduce((acc, {edgeId, sprites}) => {
              JSON.parse(`[${sprites}]`).forEach((sprite) => {
                const {name} = sprite
                if (!acc[name]) {
                  acc[name] = {edges: [], ...sprite}
                }
                acc[name].edges.push(edgeId)
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
      }
    },
    currentEdgeHighlighted(newValue) {
      this.$refs[`edge-${newValue}`][0].$el.scrollIntoView()
    }
  },

  async mounted() {
    this.setBookcaseUsername(this.bookcaseUsername)
    await this.loadBookcase()
    if (!this.isSharedBookcase) {
      await this.loadPopularIssuesInCollection()
      await this.loadLastPublishedEdgesForCurrentUser()
      await this.loadUser()
    }
  },

  methods: {
    ...mapMutations("bookcase", ["setBookcaseUsername"]),
    ...mapActions("bookcase", ["loadBookcase", "loadBookcaseTextures", "loadBookcaseOrder"]),
    ...mapActions("collection", ["loadPopularIssuesInCollection", "loadLastPublishedEdgesForCurrentUser", "loadUser"]),
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueNumbers"]),
    ...mapActions("users", ["fetchStats"]),

    getEdgeKey: edge => `${edge.publicationCode} ${edge.issueNumber}`,

    highlightIssue(issue) {
      this.currentEdgeHighlighted = this.getEdgeKey(this.bookcase.find(issueInCollection =>
        issue.publicationcode === issueInCollection.publicationCode &&
        issue.issuenumber === issueInCollection.issueNumber
      ))
    }
  }
}
</script>

<style lang="scss" scoped>
#last-published-edges,
#share-bookcase-section {
  margin-bottom: 16px;
}

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