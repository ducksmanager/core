<template>
  <div>
    <div v-if="!isSharedBookcase">
      <div
        v-if="lastPublishedEdgesForCurrentUser && lastPublishedEdgesForCurrentUser.length"
        class="mb-4"
      >
        {{ $t('Dernières tranches de votre collection ajoutées :') }}
        <div
          v-for="edge in lastPublishedEdgesForCurrentUser"
          :key="`last-published-${edge.id}`"
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
        v-html="$t('Par défaut, les magazines sont triés par pays et par magazine. Vous pouvez changer cet ordre en déplaçant les noms de magazines dans la page {0}.', [`<a href='${$r('/bookcase/options')}'>${$t('Options de la bibliothèque')}</a>`])"
      />
      <div
        v-if="user && user.isShareEnabled && username !== 'demo' && sortedBookcase && sortedBookcase.length"
        class="mb-4"
      >
        <b-alert
          variant="info"
          show
          v-html="$t('Votre bibliothèque peut être visionnée par les autres visiteurs de DucksManager. Si vous ne le souhaitez pas, désactivez le partage de collection dans la page {0}.', [`<a href='${$r('/collection/account')}'>${$t('Mon compte')}</a>`])"
        />
        <SharePage
          v-if="showShareButtons"
          :title="`${$t('Bibliothèque DucksManager de')} ${bookcaseUsername}`"
          :url="bookcaseUrl"
        />
        <b-button
          v-else
          size="sm"
          @click="showShareButtons=true"
        >
          {{ $t('Fier(e) de votre collection ? Montrez votre bibliothèque à vos amis !') }}
        </b-button>
      </div>
      <b-alert
        v-else-if="user && user.isShareEnabled === false && username !== 'demo'"
        show
        variant="warning"
        v-html="$t('Votre bibliothèque ne peut pas être visionnée par les autres visiteurs de DucksManager. Si vous souhaitez que votre bibliothèque soit accessible, activez le partage de collection dans la page {0}.', [`<a href='${$r('/collection/account')}'>${$t('Mon compte')}</a>`])"
      />
    </div>
    <div v-if="percentVisible !== null">
      {{ percentVisible }}{{ $t('% de la collection est visible dans la bibliothèque.') }}
    </div>
    <div v-if="loading">
      {{ $t('Chargement...') }}
    </div>
    <b-alert
      v-else-if="isPrivateBookcase"
      variant="warning"
      show
    >
      {{ $t('La bibliothèque de cet utilisateur est privée.') }}
    </b-alert>
    <b-alert
      v-else-if="isUserNotExisting"
      variant="warning"
      show
    >
      {{ $t("Cet utilisateur n'existe pas.") }}
    </b-alert>
    <div v-else>
      <div v-if="!isSharedBookcase">
        <UploadableEdgesCarousel
          v-if="mostPopularIssuesInCollectionWithoutEdge && mostPopularIssuesInCollectionWithoutEdge.length && userPoints"
          :issues="mostPopularIssuesInCollectionWithoutEdge"
          :user-points="userPoints.Photographe"
          :publication-names="publicationNames"
        >
          <template #header>
            {{ $t(
              "Envoyez des photos de tranches de magazines et gagnez jusqu'à {0} points par tranche !",
              [mostPopularIssuesInCollectionWithoutEdge[0].popularity]
            ) }}
          </template>
          <template #footer>
            <b-button
              class="mt-3"
              variant="info"
              href="https://edgecreator.ducksmanager.net"
              target="_blank"
            >
              {{ $t('Envoyer des photos de tranches') }}
            </b-button>
          </template>
        </UploadableEdgesCarousel>
        <IssueSearch
          v-if="sortedBookcase && sortedBookcase.length"
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
        v-if="sortedBookcase && sortedBookcase.length"
        :bookcase-textures="bookcaseOptions.textures"
        :with-all-copies="bookcaseOptions.showAllCopies"
        :current-edge-highlighted="currentEdgeHighlighted"
        :current-edge-opened="currentEdgeOpened"
        :edges-using-sprites="edgesUsingSprites"
        :image-path="imagePath"
        :sorted-bookcase="sortedBookcase"
        @open-book="(edge) => currentEdgeOpened = edge"
      />
      <b-alert
        v-else
        show
        variant="warning"
      >
        {{ $t('Cette bibliothèque est vide.') }}
      </b-alert>
    </div>
  </div>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import IssueSearch from "../../components/IssueSearch";
import {mapActions, mapState} from "pinia";
import collectionMixin from "../../mixins/collectionMixin";
import Issue from "../../components/Issue";
import Book from "../../components/Book";
import SharePage from "../../components/SharePage";
import Bookcase from "../../components/Bookcase";
import UploadableEdgesCarousel from "../../components/UploadableEdgesCarousel";
import {BAlert, BButton} from "bootstrap-vue";
import { users } from "../../stores/users";
import { bookcase } from "../../stores/bookcase";
import { collection } from "../../stores/collection";
import { coa } from "../../stores/coa";

export default {
  name: "ViewBookcase",
  components: {Bookcase, SharePage, Book, Issue, IssueSearch, UploadableEdgesCarousel, BAlert, BButton},
  mixins: [l10nMixin, collectionMixin],

  props: {
    bookcaseUsername: {type: String, required: true}
  },

  data: () => ({
    edgesUsingSprites: {},
    currentEdgeOpened: null,
    currentEdgeHighlighted: null,
    bookStartPosition: null,
    hasIssueNumbers: false,
    showShareButtons: false
  }),

  computed: {
    ...mapState(collection, ["user", "lastPublishedEdgesForCurrentUser", "popularIssuesInCollectionWithoutEdge"]),
    ...mapState(coa, ["publicationNames", "issueNumbers"]),
    ...mapState(bookcase, ["bookcaseOptions", "bookcaseOrder", "isPrivateBookcase", "isUserNotExisting", "isSharedBookcase"]),
    ...mapState(bookcase, {"bookcase": "bookcaseWithPopularities"}),
    ...mapState(users, ["points"]),

    bookcaseUrl() {
      return !this.isPrivateBookcase && `${window.location.origin}/bookcase/show/${this.username}`
    },

    loading() {
      return !this.isPrivateBookcase && !this.isUserNotExisting && !(this.sortedBookcase && this.bookcaseOptions && this.edgesUsingSprites)
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
      return this.bookcase && this.bookcaseOrder && this.hasIssueNumbers && ([...this.bookcase]).sort((
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
          vm.issueNumbers[publicationCode1].indexOf(issueNumber1.replace(/ /g, ''))
          - vm.issueNumbers[publicationCode1].indexOf(issueNumber2.replace(/ /g, ''))
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
          this.hasIssueNumbers = true
        }
      }
    },
    bookcase: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          await this.loadBookcaseOptions()
          await this.loadBookcaseOrder()
          await this.fetchStats([this.userId])

          const usableSpritesBySpriteId = newValue
            .filter(({sprites}) => sprites)
            .reduce((acc, {edgeId, sprites}) => {
              JSON.parse(`[${sprites}]`).forEach((sprite) => {
                const {name: spriteId} = sprite
                if (!acc[spriteId]) {
                  acc[spriteId] = {edges: [], ...sprite}
                }
                acc[spriteId].edges.push(edgeId)
              })
              return acc
            }, {})

          const usableSprites = Object.values(usableSpritesBySpriteId)
            .map(usableSprite => ({...usableSprite, edges: [...new Set(usableSprite.edges)]}))

          this.edgesUsingSprites = usableSprites
            .filter(({edges, size}) => edges.length >= size * 80 / 100)
            .sort(({size: aSize}, {size: bSize}) => Math.sign(aSize - bSize))
            .reduce((acc, {name, version, edges, size}) => {
              edges.forEach(edgeId => {
                acc[edgeId] = `v${version}/${name}`
                if (size <= 50) {
                  acc[edgeId] = `f_auto/${acc[edgeId]}`
                }
              })
              return acc
            }, {})
        }
      }
    },
    currentEdgeHighlighted(newValue) {
      const element = document.getElementById(`edge-${newValue}`);
      if (element) {
        element.scrollIntoView()
      }
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
    ...mapActions(bookcase, ["setBookcaseUsername", "loadBookcase", "loadBookcaseOptions", "loadBookcaseOrder"]),
    ...mapActions(collection, ["loadPopularIssuesInCollection", "loadLastPublishedEdgesForCurrentUser", "loadUser"]),
    ...mapActions(coa, ["fetchPublicationNames", "fetchIssueNumbers", "addIssueNumbers"]),
    ...mapActions(users, ["fetchStats"]),

    highlightIssue(issue) {
      this.currentEdgeHighlighted = this.bookcase.find(issueInCollection =>
        issue.publicationcode === issueInCollection.publicationCode &&
        issue.issuenumber === issueInCollection.issueNumber
      ).id
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
