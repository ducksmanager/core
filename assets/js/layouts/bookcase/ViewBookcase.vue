<template>
  <div>
    <div v-if="!isSharedBookcase">
      <div
        v-if="hasPublicationNames && lastPublishedEdgesForCurrentUser?.length"
        class="mb-4"
      >
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
      <div v-if="!isSharedBookcase && hasPublicationNames">
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
import { BAlert, BButton } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";

import Book from "../../components/Book";
import Bookcase from "../../components/Bookcase";
import Issue from "../../components/Issue";
import IssueSearch from "../../components/IssueSearch";
import SharePage from "../../components/SharePage";
import UploadableEdgesCarousel from "../../components/UploadableEdgesCarousel";
import { user } from "../../composables/global";
import { bookcase as bookcaseStore } from "../../stores/bookcase";
import { coa as coaStore } from "../../stores/coa";
import { collection as collectionStore } from "../../stores/collection";
import { l10n } from "../../stores/l10n";
import { users } from "../../stores/users";

const { bookcaseUsername } = defineProps({
  bookcaseUsername: { type: String, required: true },
});

const { r } = l10n(),
  collection = collectionStore(),
  coa = coaStore(),
  bookcase = bookcaseStore(),
  { userId, username } = user(),
  isShareEnabled = $computed(() => collection.user?.isShareEnabled),
  lastPublishedEdgesForCurrentUser = $computed(
    () => collection.lastPublishedEdgesForCurrentUser
  ),
  popularIssuesInCollectionWithoutEdge = $computed(
    () => collection.popularIssuesInCollectionWithoutEdge
  ),
  publicationNames = $computed(() => coa.publicationNames),
  issueNumbers = $computed(() => coa.issueNumbers),
  bookcaseOptions = $computed(() => bookcase.bookcaseOptions),
  bookcaseOrder = $computed(() => bookcase.bookcaseOrder),
  isPrivateBookcase = $computed(() => bookcase.isPrivateBookcase),
  isUserNotExisting = $computed(() => bookcase.isUserNotExisting),
  isSharedBookcase = $computed(() => users().isSharedBookcase),
  bookcaseUrl = $computed(
    () =>
      !isPrivateBookcase &&
      `${window.location.origin}/bookcase/show/${username}`
  ),
  loading = $computed(
    () =>
      !isPrivateBookcase &&
      !isUserNotExisting &&
      !(sortedBookcase && bookcaseOptions && edgesUsingSprites)
  ),
  userPoints = $computed(() => users().points[userId]),
  percentVisible = $computed(() =>
    bookcase.bookcase?.length
      ? parseInt(
          (100 * bookcase.bookcase.filter(({ edgeId }) => edgeId).length) /
            bookcase.bookcase.length
        )
      : null
  ),
  mostPopularIssuesInCollectionWithoutEdge = $computed(() =>
    [...popularIssuesInCollectionWithoutEdge]
      ?.sort(
        ({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 - popularity1
      )
      .filter((_, index) => index < 10)
  ),
  sortedBookcase = $computed(
    () =>
      bookcase.bookcase &&
      bookcaseOrder &&
      hasIssueNumbers &&
      [
        ...bookcase.bookcase.map((edge) => ({
          ...edge,
          publicationCode: `${edge.countryCode}/${edge.magazineCode}`,
        })),
      ].sort(
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
            bookcaseOrder.indexOf(publicationCode1) -
              bookcaseOrder.indexOf(publicationCode2)
          );
          return (
            publicationOrderSign ||
            (!issueNumbers[publicationCode1] && -1) ||
            Math.sign(
              issueNumbers[publicationCode1].indexOf(
                issueNumber1.replace(/ /g, "")
              ) -
                issueNumbers[publicationCode1].indexOf(
                  issueNumber2.replace(/ /g, "")
                )
            )
          );
        }
      )
  ),
  highlightIssue = (issue) => {
    currentEdgeHighlighted = bookcase.bookcase.find(
      (issueInCollection) =>
        issue.publicationcode === issueInCollection.publicationCode &&
        issue.issuenumber === issueInCollection.issueNumber
    ).id;
  };

let edgesUsingSprites = $ref({}),
  currentEdgeOpened = $ref(null),
  currentEdgeHighlighted = $ref(null),
  hasPublicationNames = $ref(false),
  hasIssueNumbers = $ref(false),
  showShareButtons = $ref(false);

watch(
  () => bookcaseOrder,
  async (newValue) => {
    if (newValue) {
      await coa.fetchPublicationNames(newValue);
      hasPublicationNames = true;

      const nonObviousPublicationIssueNumbers = newValue.filter(
        (publicationCode) =>
          bookcase.bookcase.filter(
            ({ publicationCode: issuePublicationCode, issueNumber }) =>
              issuePublicationCode === publicationCode &&
              !/^[0-9]$/.test(issueNumber)
          ).length
      );
      coa.addIssueNumbers(
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
      await coa.fetchIssueNumbers(nonObviousPublicationIssueNumbers);
      hasIssueNumbers = true;
    }
  },
  { immediate: true }
);
watch(
  () => bookcase.bookcase,
  async (newValue) => {
    if (newValue) {
      await bookcase.loadBookcaseOptions();
      await bookcase.loadBookcaseOrder();
      await users().fetchStats([userId]);

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

      edgesUsingSprites = usableSprites
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
  () => currentEdgeHighlighted,
  (newValue) => {
    const element = document.getElementById(`edge-${newValue}`);
    if (element) {
      element.scrollIntoView();
    }
  }
);

onMounted(async () => {
  bookcase.setBookcaseUsername(bookcaseUsername);
  await bookcase.loadBookcase();
  if (!isSharedBookcase) {
    await collection.loadPopularIssuesInCollection();
    await collection.loadLastPublishedEdgesForCurrentUser();
    await collection.loadUser();
  }
});
</script>

<style lang="scss" scoped>
</style>
