<template>
  <div>
    <div v-if="!isSharedBookcase">
      <div
        v-if="lastPublishedEdgesForCurrentUser && lastPublishedEdgesForCurrentUser.length"
        class="mb-4"
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
          />
        </div>
      </div>
      <b-alert
        variant="info"
        show
        v-html="$t('EXPLICATION_ORDRE_MAGAZINES', [`<a href='${$r('/bookcase/options')}'>${l10n.BIBLIOTHEQUE_OPTIONS_COURT}</a>`])"
      />
      <div
        v-if="user && user.isShareEnabled && username !== 'demo' && sortedBookcase.length"
        class="mb-4"
      >
        <b-alert
          variant="info"
          show
          v-html="$t('EXPLICATION_PARTAGE_BIBLIOTHEQUE_ACTIVEE', [`<a href='${$r('/collection/account')}'>${l10n.GESTION_COMPTE_COURT}</a>`])"
        />
        <SharePage
          v-if="showShareButtons"
          :title="`${l10n.BIBLIOTHEQUE_DE} ${bookcaseUsername}`"
          :url="bookcaseUrl"
        />
        <b-btn
          v-else
          size="sm"
          @click="showShareButtons=true"
        >
          {{ l10n.BIBLIOTHEQUE_PROPOSITION_PARTAGE }}
        </b-btn>
      </div>
      <b-alert
        v-else-if="user && user.isShareEnabled === false && username !== 'demo'"
        show
        variant="warning"
        v-html="$t('EXPLICATION_PARTAGE_BIBLIOTHEQUE_DESACTIVEE', [`<a href='${$r('/collection/account')}'>${l10n.GESTION_COMPTE_COURT}</a>`])"
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
          v-if="sortedBookcase.length"
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
      <Bookcase
        v-if="sortedBookcase.length"
        :bookcase-textures="bookcaseTextures"
        :current-edge-highlighted="currentEdgeHighlighted"
        :current-edge-opened="currentEdgeOpened"
        :edges-using-sprites="edgesUsingSprites"
        :image-path="imagePath"
        :sorted-bookcase="sortedBookcase"
        @open-book="(edge) => currentEdgeOpened = edge"
      />
      <b-alert
        show
        variant="warning"
      >
        {{ l10n.BIBLIOTHEQUE_VIDE }}
      </b-alert>
    </div>
  </div>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import IssueSearch from "../../components/IssueSearch";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import collectionMixin from "../../mixins/collectionMixin";
import MedalProgress from "../../components/MedalProgress";
import Issue from "../../components/Issue";
import Book from "../../components/Book";
import SharePage from "../../components/SharePage";
import Bookcase from "../../components/Bookcase";

export default {
  name: "ViewBookcase",
  components: {Bookcase, SharePage, Book, MedalProgress, Issue, IssueSearch},
  mixins: [l10nMixin, collectionMixin],

  props: {
    bookcaseUsername: {type: String, required: true}
  },

  data: () => ({
    edgesUsingSprites: {},
    currentEdgeOpened: null,
    currentEdgeHighlighted: null,
    bookStartPosition: null,
    showShareButtons: false
  }),

  computed: {
    ...mapState("bookcase", ["bookcaseTextures", "bookcaseOrder", "isPrivateBookcase"]),
    ...mapState("collection", ["user", "lastPublishedEdgesForCurrentUser"]),
    ...mapGetters("collection", ["popularIssuesInCollectionWithoutEdge"]),
    ...mapState("coa", ["publicationNames", "issueNumbers"]),
    ...mapGetters("bookcase", ["isSharedBookcase"]),
    ...mapGetters("bookcase", {"bookcase": "bookcaseWithPopularities"}),
    ...mapState("users", ["points"]),

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
      return !(this.bookcase && this.bookcase.length) ? null : parseInt(100 * this.bookcase.filter(({edgeId}) => edgeId).length / this.bookcase.length)
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
    bookcaseOrder: {
      immediate: true,
      async handler(newValue) {
        const vm = this
        if (newValue) {
          await this.fetchPublicationNames(newValue)

          const nonObviousPublicationIssueNumbers = newValue.filter(publicationCode =>
            vm.bookcase.filter(({publicationCode: issuePublicationCode, issueNumber}) =>
              issuePublicationCode === publicationCode && !/^[0-9]$/.test(issueNumber)).length
          )
          this.addIssueNumbers(
            newValue.filter(publicationCode => !nonObviousPublicationIssueNumbers.includes(publicationCode)
            ).reduce((acc, publicationCode) => ({
              ...acc,
              ...{
                [publicationCode]: vm.bookcase.filter(({publicationCode: issuePublicationCode}) => issuePublicationCode === publicationCode)
              }
            }), {})
          )
          await this.fetchIssueNumbers(nonObviousPublicationIssueNumbers)
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
    ...mapMutations("coa", ["addIssueNumbers"]),
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
