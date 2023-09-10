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
            :publicationname="publicationNames[edge.publicationcode]!"
            :issuenumber="edge.issuenumber"
            hide-condition
          />
        </div>
      </div>
      <b-alert variant="info" :model-value="true"
        ><i18n-t
          keypath="Par défaut, les magazines sont triés par pays et par magazine. Vous pouvez changer cet ordre en déplaçant les noms de magazines dans la page {link_to_bookcase_options}."
        >
          <template #link_to_bookcase_options>
            <router-link to="/bookcase/options">{{
              $t("Options de la bibliothèque")
            }}</router-link>
          </template>
        </i18n-t>
      </b-alert>
      <div
        v-if="
          allowSharing &&
          user &&
          user.username !== 'demo' &&
          sortedBookcase?.length
        "
        class="mb-4"
      >
        <b-alert variant="info" :model-value="true"
          ><i18n-t
            keypath="Votre bibliothèque peut être visionnée par les autres visiteurs de DucksManager. Si vous ne le souhaitez pas, désactivez le partage de collection dans la page {link_to_my_account}."
          >
            <template #link_to_my_account>
              <router-link to="/collection/account">{{
                $t("Mon compte")
              }}</router-link>
            </template>
          </i18n-t>
        </b-alert>
        <SharePage
          v-if="showShareButtons && bookcaseUrl"
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
        v-else-if="allowSharing === false && user && user.username !== 'demo'"
        :model-value="true"
        variant="warning"
        ><i18n-t
          keypath="Votre bibliothèque ne peut pas être visionnée par les autres visiteurs de DucksManager. Si vous souhaitez que votre bibliothèque soit accessible, activez le partage de collection dans la page {link_to_my_account}."
          ><template #link_to_my_account>
            <router-link to="/collection/account">{{
              $t("Mon compte")
            }}</router-link>
          </template>
        </i18n-t>
      </b-alert>
    </div>
    <div v-if="percentVisible !== null">
      {{ percentVisible
      }}{{ $t("% de la collection est visible dans la bibliothèque.") }}
    </div>
    <div v-if="loading">
      {{ $t("Chargement...") }}
    </div>
    <b-alert
      v-else-if="isPrivateBookcase"
      variant="warning"
      :model-value="true"
    >
      {{ $t("La bibliothèque de cet utilisateur est privée.") }}
    </b-alert>
    <b-alert
      v-else-if="isUserNotExisting"
      variant="warning"
      :model-value="true"
    >
      {{ $t("Cet utilisateur n'existe pas.") }}
    </b-alert>
    <div v-else>
      <div v-if="!isSharedBookcase && publicationNames">
        <UploadableEdgesCarousel
          v-if="mostPopularIssuesInCollectionWithoutEdge?.length && userPoints"
          :issues="mostPopularIssuesInCollectionWithoutEdge"
          :user-points="userPoints.edge_photographer"
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
        <StorySearch
          v-if="sortedBookcase?.length"
          style="float: right"
          :with-story-link="false"
          @issue-selected="highlightIssue"
        />
      </div>
      <Book
        v-if="currentEdgeOpened"
        :publicationcode="currentEdgeOpened.publicationcode"
        :issuenumber="currentEdgeOpened.issuenumber"
        @close-book="currentEdgeOpened = null"
      />
      <Bookcase
        v-if="bookcaseOptions && sortedBookcase?.length"
        :bookcase-textures="bookcaseOptions.textures"
        :with-all-copies="bookcaseOptions.showAllCopies"
        :current-edge-highlighted="currentEdgeHighlighted"
        :current-edge-opened="currentEdgeOpened"
        :edges-using-sprites="edgesUsingSprites"
        :sorted-bookcase="sortedBookcase"
        @open-book="(edge: BookcaseEdgeWithPopularity) => (currentEdgeOpened = edge)"
      />
      <b-alert v-else :model-value="true" variant="warning">
        {{ $t("Cette bibliothèque est vide.") }}
      </b-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { RouterLink } from "vue-router";

import {
  bookcase as bookcaseStore,
  BookcaseEdgeWithPopularity,
} from "~/stores/bookcase";
import { coa as coaStore } from "~/stores/coa";
import { collection as collectionStore } from "~/stores/collection";
import { users } from "~/stores/users";
import { BookcaseEdgeSprite } from "~types/BookcaseEdge";
import { SimpleIssue } from "~types/SimpleIssue";

const route = useRoute();

const collection = collectionStore();
const coa = coaStore();
const bookcase = bookcaseStore();

let edgesUsingSprites = $ref({} as { [edgeId: number]: string });
const currentEdgeOpened = $ref(null as BookcaseEdgeWithPopularity | null);
let currentEdgeHighlighted = $ref(null as number | null);
let hasPublicationNames = $ref(false as boolean);
let hasIssueNumbers = $ref(false as boolean);
const showShareButtons = $ref(false as boolean);
let userPoints = $ref(null as { [contribution: string]: number } | null);

const user = $computed(() => collection.user);
const bookcaseUsername = $computed(
  () => (route.params.username as string) || user?.username || null
);
const allowSharing = $computed(() => collection.user?.allowSharing);
const lastPublishedEdgesForCurrentUser = $computed(
  () => collection.lastPublishedEdgesForCurrentUser
);
const popularIssuesInCollectionWithoutEdge = $computed(
  () => collection.popularIssuesInCollectionWithoutEdge
);
const publicationNames = $computed(() => coa.publicationNames);
const issueNumbers = $computed(() => coa.issueNumbers);
const bookcaseOptions = $computed(() => bookcase.bookcaseOptions);
const bookcaseOrder = $computed(() => bookcase.bookcaseOrder);
const isPrivateBookcase = $computed(() => bookcase.isPrivateBookcase);
const isUserNotExisting = $computed(() => bookcase.isUserNotExisting);
const isSharedBookcase = $computed(() => bookcase.isSharedBookcase);
const bookcaseUrl = $computed(
  (): string | null =>
    (!isPrivateBookcase &&
      user &&
      `${window.location.origin}/bookcase/show/${user.username}`) ||
    null
);
const loading = $computed(
  () =>
    !isPrivateBookcase &&
    !isUserNotExisting &&
    !(sortedBookcase && bookcaseOptions && edgesUsingSprites)
);
const percentVisible = $computed(() =>
  bookcase.bookcase?.length
    ? (
        (100 * bookcase.bookcase.filter(({ edgeId }) => edgeId).length) /
        bookcase.bookcase.length
      ).toFixed(0)
    : null
);
const mostPopularIssuesInCollectionWithoutEdge = $computed(() =>
  [...(popularIssuesInCollectionWithoutEdge || [])]
    ?.sort(
      ({ popularity: popularity1 }, { popularity: popularity2 }) =>
        (popularity2 || 0) - (popularity1 || 0)
    )
    .filter((_, index) => index < 10)
);
const sortedBookcase = $computed(
  () =>
    bookcase.bookcaseWithPopularities &&
    bookcaseOrder &&
    hasIssueNumbers &&
    [...bookcase.bookcaseWithPopularities].sort(
      (
        {
          countryCode: countryCode1,
          magazineCode: magazineCode1,
          issuenumber: issueNumber1,
        },
        {
          countryCode: countryCode2,
          magazineCode: magazineCode2,
          issuenumber: issueNumber2,
        }
      ) => {
        const publicationCode1 = `${countryCode1}/${magazineCode1}`;
        if (!issueNumbers[publicationCode1]) return -1;

        const publicationCode2 = `${countryCode2}/${magazineCode2}`;
        if (!issueNumbers[publicationCode2]) return 1;

        const publicationOrderSign = Math.sign(
          bookcaseOrder.indexOf(publicationCode1) -
            bookcaseOrder.indexOf(publicationCode2)
        );
        return (
          publicationOrderSign ||
          Math.sign(
            issueNumbers[publicationCode1].indexOf(issueNumber1) -
              issueNumbers[publicationCode2].indexOf(issueNumber2)
          )
        );
      }
    )
);
const highlightIssue = (issue: SimpleIssue) => {
  currentEdgeHighlighted =
    bookcase.bookcase?.find(
      (issueInCollection) =>
        issue.publicationcode === issueInCollection.publicationcode &&
        issue.issuenumber === issueInCollection.issuenumber
    )?.id || null;
};

watch(
  () => bookcaseOrder,
  async (newValue) => {
    if (newValue) {
      await coa.fetchPublicationNames(newValue);
      hasPublicationNames = true;

      const nonObviousPublicationIssueNumbers = newValue.filter(
        (publicationcode) =>
          bookcase.bookcase?.some(
            ({
              countryCode: issueCountryCode,
              magazineCode: issueMagazineCode,
              issuenumber,
            }) =>
              `${issueCountryCode}/${issueMagazineCode}` === publicationcode &&
              !/^[0-9]+$/.test(issuenumber)
          )
      );
      console.log(nonObviousPublicationIssueNumbers);
      coa.addIssueNumbers(
        newValue
          .filter(
            (publicationcode) =>
              !nonObviousPublicationIssueNumbers.includes(publicationcode)
          )
          .reduce(
            (acc, publicationcode) => ({
              ...acc,
              ...{
                [publicationcode]:
                  bookcase.bookcase
                    ?.filter(
                      ({ publicationcode: issuePublicationCode }) =>
                        issuePublicationCode === publicationcode
                    )
                    .map(({ issuenumber }) => issuenumber)
                    .sort((issuenumber, issuenumber2) =>
                      Math.sign(parseInt(issuenumber) - parseInt(issuenumber2))
                    ) || [],
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

      const usableSpritesBySpriteId = newValue
        .filter(({ sprites }) => sprites)
        .reduce((acc, { edgeId, sprites }) => {
          sprites.forEach((sprite: BookcaseEdgeSprite) => {
            const { name: spriteId } = sprite;
            if (!acc[spriteId]) acc[spriteId] = { edges: [], ...sprite };

            acc[spriteId].edges.push(edgeId);
          });
          return acc;
        }, {} as { [spriteId: string]: BookcaseEdgeSprite & { edges: number[] } });

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
            if (size <= 20) {
              acc[edgeId] = `f_auto/${acc[edgeId]}`;
            }
          });
          return acc;
        }, {} as { [edgeId: number]: string });
    }
  },
  { immediate: true }
);

watch(
  () => bookcase.bookcase && !isSharedBookcase,
  async (hasNonSharedBookcase) => {
    if (hasNonSharedBookcase && user) {
      await users().fetchStats([user.id]);
    }
  }
);

watch(
  () => currentEdgeHighlighted,
  (newValue) => {
    const element = document.getElementById(`edge-${newValue}`);
    if (element) element.scrollIntoView();
  }
);

watch(
  () => bookcaseUsername,
  async (newValue) => {
    if (newValue) {
      bookcase.bookcaseUsername = newValue;
      await bookcase.loadBookcase();
      if (user && !isSharedBookcase) {
        await collection.loadPopularIssuesInCollection();
        await collection.loadLastPublishedEdgesForCurrentUser();
        userPoints = users().points[user.id];
      }
    }
  },
  { immediate: true }
);
</script>
