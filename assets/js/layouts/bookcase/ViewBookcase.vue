<template>
  <div>
    <div v-if="!isSharedBookcase">
      <div v-if="lastPublishedEdgesForCurrentUser?.length" class="mb-4">
        {{ $t("Dernières tranches de votre collection ajoutées :") }}
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
        v-html="
          $t(
            'Par défaut, les magazines sont triés par pays et par magazine. Vous pouvez changer cet ordre en déplaçant les noms de magazines dans la page {0}.',
            [
              `<a href='${r('/bookcase/options')}'>${$t(
                'Options de la bibliothèque'
              )}</a>`,
            ]
          )
        "
      />
      <div
        v-if="isShareEnabled && username !== 'demo' && sortedBookcase?.length"
        class="mb-4"
      >
        <b-alert
          variant="info"
          show
          v-html="
            $t(
              'Votre bibliothèque peut être visionnée par les autres visiteurs de DucksManager. Si vous ne le souhaitez pas, désactivez le partage de collection dans la page {0}.',
              [`<a href='${r('/collection/account')}'>${$t('Mon compte')}</a>`]
            )
          "
        />
        <SharePage
          v-if="showShareButtons"
          :title="`${$t('Bibliothèque DucksManager de')} ${bookcaseUsername}`"
          :url="bookcaseUrl"
        />
        <b-button v-else size="sm" @click="showShareButtons = true">
          {{
            $t(
              "Fier(e) de votre collection ? Montrez votre bibliothèque à vos amis !"
            )
          }}
        </b-button>
      </div>
      <b-alert
        v-else-if="isShareEnabled === false && username !== 'demo'"
        show
        variant="warning"
        v-html="
          $t(
            'Votre bibliothèque ne peut pas être visionnée par les autres visiteurs de DucksManager. Si vous souhaitez que votre bibliothèque soit accessible, activez le partage de collection dans la page {0}.',
            [`<a href='${r('/collection/account')}'>${$t('Mon compte')}</a>`]
          )
        "
      />
    </div>
    <div v-if="percentVisible !== null">
      {{ percentVisible
      }}{{ $t("% de la collection est visible dans la bibliothèque.") }}
    </div>
    <div v-if="loading">
      {{ $t("Chargement...") }}
    </div>
    <b-alert v-else-if="isPrivateBookcase" variant="warning" show>
      {{ $t("La bibliothèque de cet utilisateur est privée.") }}
    </b-alert>
    <b-alert v-else-if="isUserNotExisting" variant="warning" show>
      {{ $t("Cet utilisateur n'existe pas.") }}
    </b-alert>
    <div v-else>
      <div v-if="!isSharedBookcase">
        <UploadableEdgesCarousel
          v-if="mostPopularIssuesInCollectionWithoutEdge?.length && userPoints"
          :issues="mostPopularIssuesInCollectionWithoutEdge"
          :user-points="userPoints.Photographe"
          :publication-names="publicationNames"
        >
          <template #header>
            {{
              $t(
                "Envoyez des photos de tranches de magazines et gagnez jusqu'à {0} points par tranche !",
                [mostPopularIssuesInCollectionWithoutEdge[0].popularity]
              )
            }}
          </template>
          <template #footer>
            <b-button
              class="mt-3"
              variant="info"
              href="https://edgecreator.ducksmanager.net"
              target="_blank"
            >
              {{ $t("Envoyer des photos de tranches") }}
            </b-button>
          </template>
        </UploadableEdgesCarousel>
        <IssueSearch
          v-if="sortedBookcase?.length"
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
        v-if="sortedBookcase?.length"
        :bookcase-textures="bookcaseOptions.textures"
        :with-all-copies="bookcaseOptions.showAllCopies"
        :current-edge-highlighted="currentEdgeHighlighted"
        :current-edge-opened="currentEdgeOpened"
        :edges-using-sprites="edgesUsingSprites"
        :sorted-bookcase="sortedBookcase"
        @open-book="(edge) => (currentEdgeOpened = edge)"
      />
      <b-alert v-else show variant="warning">
        {{ $t("Cette bibliothèque est vide.") }}
      </b-alert>
    </div>
  </div>
</template>

<script setup>
import IssueSearch from "../../components/IssueSearch";
import Issue from "../../components/Issue";
import Book from "../../components/Book";
import SharePage from "../../components/SharePage";
import Bookcase from "../../components/Bookcase";
import UploadableEdgesCarousel from "../../components/UploadableEdgesCarousel";
import { BAlert, BButton } from "bootstrap-vue-3";
import { users } from "../../stores/users";
const { bookcase: bookcaseStore } = require("../../stores/bookcase");
const { collection: collectionStore } = require("../../stores/collection");
const { coa: coaStore } = require("../../stores/coa");
import { l10n } from "../../stores/l10n";
import { user } from "../../composables/global";
import { computed, onMounted, watch, ref } from "vue";

defineProps({
  bookcaseUsername: { type: String, required: true },
});

const { r } = l10n(),
  collection = collectionStore(),
  coa = coaStore(),
  bookcase = bookcaseStore(),
  edgesUsingSprites = ref({}),
  currentEdgeOpened = ref(null),
  currentEdgeHighlighted = ref(null),
  hasIssueNumbers = ref(false),
  showShareButtons = ref(false),
  { userId, username } = user(),
  isShareEnabled = computed(() => collection.user.isShareEnabled),
  lastPublishedEdgesForCurrentUser = computed(
    () => collection.lastPublishedEdgesForCurrentUser
  ),
  popularIssuesInCollectionWithoutEdge = computed(
    () => collection.popularIssuesInCollectionWithoutEdge
  ),
  publicationNames = computed(() => coa.publicationNames),
  issueNumbers = computed(() => coa.issueNumbers),
  bookcaseOptions = computed(() => bookcase.bookcaseOptions),
  bookcaseOrder = computed(() => bookcase.bookcaseOrder),
  isPrivateBookcase = computed(() => bookcase.isPrivateBookcase),
  isUserNotExisting = computed(() => bookcase.isUserNotExisting),
  isSharedBookcase = computed(() => users().isSharedBookcase),
  bookcaseUrl = computed(
    () =>
      !isPrivateBookcase.value &&
      `${window.location.origin}/bookcase/show/${username}`
  ),
  loading = computed(
    () =>
      !isPrivateBookcase.value &&
      !isUserNotExisting.value &&
      !(
        sortedBookcase.value &&
        bookcaseOptions.value &&
        edgesUsingSprites.value
      )
  ),
  userPoints = computed(() => points.value?.[userId]),
  percentVisible = computed(() =>
    bookcase.bookcase.length
      ? null
      : (
          100 * bookcase.bookcase.filter(({ edgeId }) => edgeId).length
        ).toPrecision(0) / bookcase.bookcase.length
  ),
  mostPopularIssuesInCollectionWithoutEdge = computed(() =>
    [...popularIssuesInCollectionWithoutEdge.value]
      ?.sort(
        ({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 - popularity1
      )
      .filter((_, index) => index < 10)
  ),
  sortedBookcase = computed(
    () =>
      bookcase.bookcase &&
      bookcaseOrder.value &&
      hasIssueNumbers.value &&
      [...bookcase.bookcase].sort(
        (
          {
            countryCode: countryCode1,
            magazineCode: magazineCode1,
            issueNumber: issueNumber1,
          },
          {
            countryCode: countryCode2,
            magazineCode: magazineCode2,
            issueNumber: issueNumber2,
          }
        ) => {
          const publicationCode1 = `${countryCode1}/${magazineCode1}`;
          const publicationCode2 = `${countryCode2}/${magazineCode2}`;
          const publicationOrderSign = Math.sign(
            bookcaseOrder.value.indexOf(publicationCode1) -
              bookcaseOrder.value.indexOf(publicationCode2)
          );
          return (
            publicationOrderSign ||
            (!issueNumbers.value[publicationCode1] && -1) ||
            Math.sign(
              issueNumbers.value[publicationCode1].indexOf(
                issueNumber1.replace(/ /g, "")
              ) -
                issueNumbers.value[publicationCode1].indexOf(
                  issueNumber2.replace(/ /g, "")
                )
            )
          );
        }
      )
  ),
  setBookcaseUsername = bookcase.setBookcaseUsername,
  loadBookcase = bookcase.loadBookcase,
  loadBookcaseOptions = bookcase.loadBookcaseOptions,
  loadBookcaseOrder = bookcase.loadBookcaseOrder,
  loadPopularIssuesInCollection = collection.loadPopularIssuesInCollection,
  loadLastPublishedEdgesForCurrentUser =
    collection.loadLastPublishedEdgesForCurrentUser,
  loadUser = collection.loadUser,
  fetchPublicationNames = coa.fetchPublicationNames,
  fetchIssueNumbers = coa.fetchIssueNumbers,
  addIssueNumbers = coa.addIssueNumbers,
  fetchStats = users().fetchStats,
  highlightIssue = (issue) => {
    currentEdgeHighlighted.value = bookcase.bookcase.find(
      (issueInCollection) =>
        issue.publicationcode === issueInCollection.publicationCode &&
        issue.issuenumber === issueInCollection.issueNumber
    ).id;
  };

watch(
  () => bookcaseOrder.value,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(newValue);

      const nonObviousPublicationIssueNumbers = newValue.filter(
        (publicationCode) =>
          bookcase.bookcase.filter(
            ({ publicationCode: issuePublicationCode, issueNumber }) =>
              issuePublicationCode === publicationCode &&
              !/^[0-9]$/.test(issueNumber)
          ).length
      );
      addIssueNumbers(
        newValue
          .filter(
            (publicationCode) =>
              !nonObviousPublicationIssueNumbers.includes(publicationCode)
          )
          .reduce(
            (acc, publicationCode) => ({
              ...acc,
              ...{
                [publicationCode]: bookcase.bookcase.filter(
                  ({ publicationCode: issuePublicationCode }) =>
                    issuePublicationCode === publicationCode
                ),
              },
            }),
            {}
          )
      );
      await fetchIssueNumbers(nonObviousPublicationIssueNumbers);
      hasIssueNumbers.value = true;
    }
  },
  { immediate: true }
);
watch(
  () => bookcase.bookcase.value,
  async (newValue) => {
    if (newValue) {
      await loadBookcaseOptions();
      await loadBookcaseOrder();
      await fetchStats([userId]);

      const usableSpritesBySpriteId = newValue
        .filter(({ sprites }) => sprites)
        .reduce((acc, { edgeId, sprites }) => {
          JSON.parse(`[${sprites}]`).forEach((sprite) => {
            const { name: spriteId } = sprite;
            if (!acc[spriteId]) {
              acc[spriteId] = { edges: [], ...sprite };
            }
            acc[spriteId].edges.push(edgeId);
          });
          return acc;
        }, {});

      const usableSprites = Object.values(usableSpritesBySpriteId).map(
        (usableSprite) => ({
          ...usableSprite,
          edges: [...new Set(usableSprite.edges)],
        })
      );

      edgesUsingSprites.value = usableSprites
        .filter(({ edges, size }) => edges.length >= (size * 80) / 100)
        .sort(({ size: aSize }, { size: bSize }) => Math.sign(aSize - bSize))
        .reduce((acc, { name, version, edges, size }) => {
          edges.forEach((edgeId) => {
            acc[edgeId] = `v${version}/${name}`;
            if (size <= 50) {
              acc[edgeId] = `f_auto/${acc[edgeId]}`;
            }
          });
          return acc;
        }, {});
    }
  },
  { immediate: true }
);

watch(
  () => currentEdgeHighlighted.value,
  (newValue) => {
    const element = document.getElementById(`edge-${newValue}`);
    if (element) {
      element.scrollIntoView();
    }
  }
);

onMounted(async () => {
  setBookcaseUsername(bookcaseUsername.value);
  await loadBookcase();
  if (!isSharedBookcase.value) {
    await loadPopularIssuesInCollection();
    await loadLastPublishedEdgesForCurrentUser();
    await loadUser();
  }
});
</script>

<style lang="scss" scoped>
</style>
