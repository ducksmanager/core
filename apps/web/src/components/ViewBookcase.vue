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
          :title="
            $t('Bibliothèque DucksManager de {username}', {
              username: bookcaseUsername,
            })
          "
          :url="bookcaseUrl"
        />
        <b-button v-else size="sm" @click="showShareButtons = true">
          {{
            $t(
              "Fier(e) de votre collection ? Montrez votre bibliothèque à vos amis !",
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
                [mostPopularIssuesInCollectionWithoutEdge[0].popularity],
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
          :is-public="isSharedBookcase"
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
        @open-book="
          (edge: BookcaseEdgeWithPopularity) => (currentEdgeOpened = edge)
        "
      />
      <b-alert
        v-else-if="sortedBookcase && !sortedBookcase.length"
        :model-value="true"
        variant="warning"
      >
        {{ $t("Cette bibliothèque est vide.") }}
      </b-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookcaseEdgeWithPopularity } from "~/stores/bookcase";
import { BookcaseEdgeSprite } from "~dm-types/BookcaseEdge";
import { SimpleIssue } from "~dm-types/SimpleIssue";

const route = useRoute();

const { fetchStats } = users();
const { points } = storeToRefs(users());

const { loadPopularIssuesInCollection, loadLastPublishedEdgesForCurrentUser } =
  collection();
const {
  user,
  lastPublishedEdgesForCurrentUser,
  popularIssuesInCollectionWithoutEdge,
} = storeToRefs(collection());

const { fetchPublicationNames, addIssueNumbers, fetchIssueNumbers } = coa();
const { publicationNames, issueNumbers } = storeToRefs(coa());

const { loadBookcase, loadBookcaseOptions, loadBookcaseOrder } = bookcase();
const {
  bookcase: thisBookcase,
  bookcaseOptions,
  bookcaseUsername,
  bookcaseWithPopularities,
  bookcaseOrder,
  isPrivateBookcase,
  isUserNotExisting,
  isSharedBookcase,
} = storeToRefs(bookcase());

let edgesUsingSprites = $ref<{ [edgeId: number]: string }>({});
const currentEdgeOpened = $shallowRef<BookcaseEdgeWithPopularity | null>(null);
let currentEdgeHighlighted = $ref<number | null>(null);
let hasPublicationNames = $ref(false);
let hasIssueNumbers = $ref(false);
const showShareButtons = $ref(false);
let userPoints = $ref<{ [contribution: string]: number } | null>(null);

const inputBookcaseUsername = $computed(
  () => (route.params.username as string) || user.value?.username || null,
);
const allowSharing = $computed(() => user.value?.allowSharing);
const bookcaseUrl = $computed(
  (): string | null =>
    (!isPrivateBookcase &&
      user.value &&
      `${window.location.origin}/bookcase/show/${user.value.username}`) ||
    null,
);
const loading = $computed(
  () =>
    !isPrivateBookcase &&
    !isUserNotExisting &&
    !(sortedBookcase && bookcaseOptions && edgesUsingSprites),
);
const percentVisible = $computed(() =>
  thisBookcase.value?.length
    ? (
        (100 * thisBookcase.value.filter(({ edgeId }) => edgeId).length) /
        thisBookcase.value.length
      ).toFixed(0)
    : null,
);
const mostPopularIssuesInCollectionWithoutEdge = $computed(() =>
  [...(popularIssuesInCollectionWithoutEdge.value || [])]
    ?.sort(
      ({ popularity: popularity1 }, { popularity: popularity2 }) =>
        (popularity2 || 0) - (popularity1 || 0),
    )
    .filter((_, index) => index < 10),
);
const sortedBookcase = $computed(
  () =>
    bookcaseWithPopularities.value &&
    bookcaseOrder.value &&
    hasIssueNumbers &&
    [...bookcaseWithPopularities.value].sort(
      (
        { publicationcode: publicationcode1, issuenumber: issueNumber1 },
        { publicationcode: publicationcode2, issuenumber: issueNumber2 },
      ) => {
        if (!issueNumbers.value[publicationcode1]) return -1;

        if (!issueNumbers.value[publicationcode2]) return 1;

        const publicationOrderSign = Math.sign(
          bookcaseOrder.value!.indexOf(publicationcode1) -
            bookcaseOrder.value!.indexOf(publicationcode2),
        );
        return (
          publicationOrderSign ||
          Math.sign(
            issueNumbers.value[publicationcode1].indexOf(issueNumber1) -
              issueNumbers.value[publicationcode2].indexOf(issueNumber2),
          )
        );
      },
    ),
);
const highlightIssue = (issue: SimpleIssue) => {
  currentEdgeHighlighted =
    thisBookcase.value?.find(
      (issueInCollection) =>
        issue.publicationcode === issueInCollection.publicationcode &&
        issue.issuenumber === issueInCollection.issuenumber,
    )?.id || null;
};

watch(
  bookcaseOrder,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(newValue);
      hasPublicationNames = true;

      const nonObviousPublicationIssueNumbers = newValue.filter(
        (publicationcode) =>
          thisBookcase.value?.some(
            ({ publicationcode: issuePublicationcode, issuenumber }) =>
              issuePublicationcode === publicationcode &&
              !/^[0-9]+$/.test(issuenumber),
          ),
      );
      addIssueNumbers(
        newValue
          .filter(
            (publicationcode) =>
              !nonObviousPublicationIssueNumbers.includes(publicationcode),
          )
          .reduce(
            (acc, publicationcode) => ({
              ...acc,
              ...{
                [publicationcode]:
                  thisBookcase.value
                    ?.filter(
                      ({ publicationcode: issuePublicationCode }) =>
                        issuePublicationCode === publicationcode,
                    )
                    .map(({ issuenumber }) => issuenumber)
                    .sort((issuenumber, issuenumber2) =>
                      Math.sign(parseInt(issuenumber) - parseInt(issuenumber2)),
                    ) || [],
              },
            }),
            {},
          ),
      );
      await fetchIssueNumbers(nonObviousPublicationIssueNumbers);
      hasIssueNumbers = true;
    }
  },
  { immediate: true },
);

watch(
  thisBookcase,
  async (newValue) => {
    if (newValue) {
      await loadBookcaseOptions();
      await loadBookcaseOrder();

      const usableSpritesBySpriteId = newValue
        .filter(({ sprites }) => sprites)
        .reduce(
          (acc, { edgeId, sprites }) => {
            sprites.forEach((sprite: BookcaseEdgeSprite) => {
              const { name: spriteId } = sprite;
              if (!acc[spriteId]) acc[spriteId] = { edges: [], ...sprite };

              acc[spriteId].edges.push(edgeId);
            });
            return acc;
          },
          {} as {
            [spriteId: string]: BookcaseEdgeSprite & { edges: number[] };
          },
        );

      const usableSprites = Object.values(usableSpritesBySpriteId).map(
        (usableSprite) => ({
          ...usableSprite,
          edges: [...new Set(usableSprite.edges)],
        }),
      );

      edgesUsingSprites = usableSprites
        .filter(({ edges, size }) => edges.length >= (size * 80) / 100)
        .sort(({ size: aSize }, { size: bSize }) => Math.sign(aSize - bSize))
        .reduce(
          (acc, { name, version, edges, size }) => {
            edges.forEach((edgeId) => {
              acc[edgeId] = `v${version}/${name}`;
              if (size <= 20) {
                acc[edgeId] = `f_auto/${acc[edgeId]}`;
              }
            });
            return acc;
          },
          {} as { [edgeId: number]: string },
        );
    }
  },
  { immediate: true },
);

watch(
  () => thisBookcase.value && !isSharedBookcase.value,
  async (hasNonSharedBookcase) => {
    if (hasNonSharedBookcase && user.value) {
      await fetchStats([user.value.id]);
    }
  },
);

watch($$(currentEdgeHighlighted), (newValue) => {
  document.getElementById(`edge-${newValue}`)?.scrollIntoView();
});

watch(
  $$(inputBookcaseUsername),
  async (newValue) => {
    if (newValue) {
      bookcaseUsername.value = newValue;
      await loadBookcase();
      if (user.value && !isSharedBookcase.value) {
        await loadPopularIssuesInCollection();
        await loadLastPublishedEdgesForCurrentUser();
        userPoints = points.value[user.value.id];
      }
    }
  },
  { immediate: true },
);
</script>
