<template>
  <div class="mt-4">
    <Publication
      size="xl"
      :publicationcode="publicationcode"
      :publicationname="publicationName"
    >
      <Watch v-if="showFilter" class="ml-2" :publicationcode="publicationcode"
    /></Publication>
    <div v-if="issues && purchases">
      <div v-if="showFilter" v-once class="issue-filter">
        <table>
          <tr
            v-for="conditionFilter in ['possessed', 'missing']"
            :key="conditionFilter"
          >
            <td>
              <input
                :id="`show-${conditionFilter}`"
                v-model="filter[conditionFilter as 'possessed'|'missing']"
                type="checkbox"
              />
            </td>
            <td>
              <label :for="`show-${conditionFilter}`">
                <template v-if="conditionFilter === 'possessed'">{{
                  $t("Afficher les numéros possédés")
                }}</template>
                <template v-else-if="conditionFilter === 'missing'"
                  >{{ $t("Afficher les numéros manquants") }}
                </template>
                ({{
                  conditionFilter === "possessed"
                    ? ownedIssuesCount
                    : issues.length - ownedIssuesCount
                }})
              </label>
            </td>
          </tr>
        </table>
      </div>
      <div class="issue-list">
        <b-alert
          v-if="userIssuesNotFoundForPublication?.length"
          show
          variant="warning"
        >
          {{
            $t(
              "Certains des numéros que vous possédez pour ce magazine n'existent plus. Cela peut se produire lorsque des numéros ont été renommés. Pour chaque numéro n'existant plus, trouvez le numéro de remplacement, puis supprimez l'ancien numéro en cliquant sur le bouton correspondant ci-dessous."
            )
          }}
          <ul>
            <li
              v-for="issueNotFound in userIssuesNotFoundForPublication"
              :key="`notfound-${issueNotFound.issuenumber}`"
            >
              {{ $t("n°") }}{{ issueNotFound.issuenumber }}
              <b-button
                size="sm"
                @click="deletePublicationIssues([issueNotFound])"
              >
                {{ $t("Supprimer") }}
              </b-button>
            </li>
          </ul>
        </b-alert>
        <b-alert v-if="showFilter" v-once show variant="info" class="mb-0">
          {{
            $t(
              "Cliquez sur les numéros que vous souhaitez ajouter à votre collection,"
            )
          }}
          <span v-if="isTouchScreen">{{
            $t("puis faites un appui long pour indiquer son état et validez.")
          }}</span>
          <span v-else>{{
            $t("puis faites un clic droit pour indiquer son état et validez.")
          }}</span>
        </b-alert>
        <Book
          v-if="currentIssueOpened"
          :publicationcode="currentIssueOpened.publicationcode"
          :issuenumber="currentIssueOpened.issuenumber"
          @close-book="currentIssueOpened = null"
        />
        <div v-contextmenu:contextmenu>
          <div
            v-for="(
              { issuenumber, title, userCopies, key }, idx
            ) in filteredIssues"
            :id="key"
            :key="key"
            class="issue"
            :class="{
              [`issue-${
                userCopies.length && !onSaleByOthers ? 'possessed' : 'missing'
              }`]: true,
              preselected: preselected.includes(key),
              selected: selected.includes(key),
            }"
            @mousedown.self.left="
              preselectedIndexStart = preselectedIndexEnd = idx
            "
            @mouseup.self.left="updateSelected"
            @mouseover="
              preselectedIndexEnd = preselectedIndexStart === null ? null : idx
            "
          >
            <span>
              <IssueDetailsPopover
                :publicationcode="publicationcode"
                :issuenumber="issuenumber"
                @click="openBook(issuenumber)"
              />

              <span class="issue-text">
                {{ issueNumberTextPrefix }}{{ issuenumber }}
                <span class="issue-title">{{ title }}</span>
              </span>
            </span>
            <div class="issue-details-wrapper">
              <MarketplaceBuyerInfo
                v-if="!userCopies.length"
                :publicationcode="publicationcode"
                :issuenumber="issuenumber"
              />
              <div class="issue-copies">
                <div
                  v-for="(
                    { condition: copyCondition, isToRead, purchaseId, id },
                    copyIndex
                  ) in userCopies"
                  :key="`${issuenumber}-copy-${copyIndex}`"
                  class="issue-copy"
                >
                  <MarketplaceBuyerInfo
                    v-if="onSaleByOthers"
                    :publicationcode="publicationcode"
                    :issuenumber="issuenumber"
                  />
                  <MarketplaceSellerInfo :issue-id="id" />
                  <svg
                    v-if="
                      purchaseId &&
                      purchases.find(({ id }) => id === purchaseId)
                    "
                    width="1em"
                    height="1em"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    role="img"
                    focusable="false"
                    class="issue-purchase-date"
                  >
                    <title :id="`purchase-${purchaseId}`">
                      {{ boughtOnTextPrefix }}
                      {{ purchases.find(({ id }) => id === purchaseId)!.date }}
                    </title>
                    <path
                      d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"
                    />
                  </svg>
                  <b-icon-bookmark-check
                    v-if="isToRead"
                    class="issue-to-read"
                  />

                  <Condition
                    v-if="copyCondition"
                    :publicationcode="publicationcode"
                    :issuenumber="issuenumber"
                    :value="copyCondition"
                  />
                </div>
              </div>
              <Watch
                v-if="!userCopies.length || onSaleByOthers"
                :publicationcode="publicationcode"
                :issuenumber="issuenumber"
                :constant-width="onSaleByOthers"
              />
              <div class="issue-check">
                <input
                  type="checkbox"
                  disabled
                  :checked="selected.includes(key)"
                  @click.prevent="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="loading">
      {{ $t("Chargement...") }}
    </div>
  </div>
  <div v-if="!publicationNameLoading && issues && !issues.length">
    <b-alert variant="danger" show>
      <div class="mb-4">
        {{ $t("Aucun numéro n'est répertorié pour") }}
        {{ publicationcode.split("/")[1] }} ({{ $t("Pays de publication") }} :
        {{ country }})
      </div>
      <div v-if="userIssuesForPublication?.length">
        {{
          $t(
            "Souhaitez-vous supprimer ce magazine de votre collection ? Les numéros suivants seront supprimés de votre collection dans ce cas :"
          )
        }}
        <ul>
          <li
            v-for="issueToDelete in userIssuesForPublication"
            :key="issueToDelete.issuenumber"
          >
            {{ issueToDelete.issuenumber }}
          </li>
        </ul>
        <b-button
          variant="danger"
          @click="deletePublicationIssues(userIssuesForPublication!)"
        >
          {{ $t("Supprimer") }}
        </b-button>
      </div>
    </b-alert>
  </div>

  <v-contextmenu ref="contextmenu">
    <component
      :is="contextMenuComponent"
      ref="contextMenu"
      :key="contextMenuKey"
      :publicationcode="publicationcode"
      :selected-issues-by-id="selectedIssuesById"
      :selected-issues="selected"
      :copies="selectedIssuesCopies"
      @clear-selection="
        contextmenu.hide();
        selected = [];
      "
      @close="
        contextMenuKey = `context-menu-${Math.random()}`;
        contextmenu.hide();
      "
      @launch-modal="emit('launch-modal', $event)"
    />
  </v-contextmenu>
</template>

<script setup lang="ts">
import { BIconBookmarkCheck } from "bootstrap-icons-vue";
import { BAlert, BButton } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import condition from "~/composables/condition";
import { coa } from "~/stores/coa";
import {
  collection as collectionStore,
  IssueWithPublicationcode,
} from "~/stores/collection";
import { issue } from "~prisma_clients/client_dm";

import ContextMenuOnSaleByOthers from "./ContextMenuOnSaleByOthers.vue";
import ContextMenuOwnCollection from "./ContextMenuOwnCollection.vue";

type simpleIssue = {
  issuenumber: string;
  title?: string;
  key: string;
};
type issueWithPublicationCodeAndCopies = simpleIssue & {
  userCopies: issue[];
};

const {
  contextMenuComponentName = "context-menu-own-collection",
  customIssues = null,
  duplicatesOnly = false,
  groupUserCopies = true,
  onSaleStackOnly = false,
  publicationcode,
  readStackOnly = false,
  onSaleByOthers = false,
} = defineProps<{
  publicationcode: string;
  duplicatesOnly?: boolean;
  readStackOnly?: boolean;
  onSaleStackOnly?: boolean;
  customIssues?: IssueWithPublicationcode[];
  onSaleByOthers?: boolean;
  groupUserCopies?: boolean;
  contextMenuComponentName?: string;
}>();

const { conditions } = condition();
const { t: $t } = useI18n();

const emit = defineEmits<{
  (
    e: "launch-modal",
    options: {
      contactMethod: string;
      sellerId: number;
      selectedIssueIds: number[];
    }
  ): void;
}>();

let contextMenuComponent:
  | typeof ContextMenuOnSaleByOthers
  | typeof ContextMenuOwnCollection;
switch (contextMenuComponentName) {
  case "context-menu-on-sale-by-others":
    contextMenuComponent = ContextMenuOnSaleByOthers;
    break;
  default:
    contextMenuComponent = ContextMenuOwnCollection;
    break;
}

let loading = $ref(true as boolean);
let publicationNameLoading = $ref(true as boolean);
const filter = $ref({
  missing: true,
  possessed: true,
} as { missing: boolean; possessed: boolean });
const contextmenu = $ref(null as any | null);
let issues = $shallowRef(null as issueWithPublicationCodeAndCopies[] | null);
let userIssuesForPublication = $shallowRef(
  null as IssueWithPublicationcode[] | null
);
let userIssuesNotFoundForPublication = $shallowRef(
  [] as IssueWithPublicationcode[] | null
);
let selected = $shallowRef([] as string[]);
const filteredUserCopies = $computed(() =>
  filteredIssues.reduce(
    (acc, { userCopies }) => [...acc, ...userCopies],
    [] as issue[]
  )
);
const selectedIssuesById = $computed(() =>
  selected.reduce(
    (acc, issueKey) => ({
      ...acc,
      ...filteredUserCopies
        .filter(
          ({ issuenumber: copyIssueNumber }) =>
            issueKey.split("-id-")[0] === copyIssueNumber
        )
        .reduce(
          (acc2, { id, issuenumber }) => ({ ...acc2, [id]: issuenumber }),
          {} as { [id: number]: string }
        ),
    }),
    {}
  )
);
let preselected = $shallowRef([] as string[]);
let preselectedIndexStart = $ref(null as number | null);
let preselectedIndexEnd = $ref(null as number | null);
let currentIssueOpened = $shallowRef(
  null as { publicationcode: string; issuenumber: string } | null
);
const issueNumberTextPrefix = $computed(() => $t("n°"));
const boughtOnTextPrefix = $computed(() => $t("Acheté le"));
const showFilter = $computed(
  () => !duplicatesOnly && !readStackOnly && !onSaleStackOnly
);

let contextMenuKey = $ref("context-menu" as string);
const publicationNames = $computed(() => coa().publicationNames);
const coverUrls = $computed(() => coa().coverUrls);
const userIssues = $computed(
  () => customIssues || collectionStore().collection
);
let purchases = $computed(() => collectionStore().purchases);
const country = $computed(() => publicationcode.split("/")[0]);
const publicationName = $computed(() => publicationNames[publicationcode]);
const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
const filteredIssues = $computed(
  () =>
    issues?.filter(
      ({ userCopies }) =>
        (filter.possessed && userCopies!.length) ||
        (filter.missing && !userCopies!.length)
    ) || []
);
const selectedIssuesCopies = $computed(() =>
  userIssuesForPublication!.filter(
    ({ issuenumber }, idx) =>
      selected.includes(issuenumber) &&
      (selected.length === 1 ||
        userIssuesForPublication!.some(
          ({ issuenumber: issuenumber2 }, idx2) =>
            issuenumber2 === issuenumber && idx !== idx2
        ))
  )
);
const ownedIssuesCount = $computed(
  () =>
    issues?.reduce(
      (acc, { userCopies }) => acc + (userCopies.length ? 1 : 0),
      0
    ) || 0
);
const fetchPublicationNames = coa().fetchPublicationNames;
const loadPurchases = collectionStore().loadPurchases;
const getPreselected = () =>
  [preselectedIndexStart, preselectedIndexEnd].includes(null)
    ? preselected
    : filteredIssues
        .map(({ key }) => key || "")
        .filter(
          (issuenumber, index) =>
            preselectedIndexStart &&
            preselectedIndexEnd &&
            index >= preselectedIndexStart &&
            index <= preselectedIndexEnd
        );
const updateSelected = () => {
  selected = issues!
    .map(({ key }) => key || "")
    .filter(
      (itemKey) => selected.includes(itemKey) !== preselected.includes(itemKey)
    );
  preselectedIndexStart = preselectedIndexEnd = null;
  preselected = [];
};
const deletePublicationIssues = async (
  issuesToDelete: IssueWithPublicationcode[]
) => {
  contextmenu.hide();
  await collectionStore().updateCollection({
    publicationcode,
    issueNumbers: issuesToDelete.map(({ issuenumber }) => issuenumber),
    condition:
      conditions.find(({ value }) => value === "missing")?.dbValue ||
      "indefini",
    isToRead: false,
    isOnSale: false,
    purchaseId: null,
  });
  selected = [];
};

const openBook = (issuenumber: string) => {
  currentIssueOpened = coverUrls[issuenumber]
    ? { publicationcode: publicationcode, issuenumber }
    : null;
};

const loadIssues = async () => {
  if (userIssues) {
    userIssuesForPublication = userIssues
      .filter(
        ({ country, magazine }) => `${country}/${magazine}` === publicationcode
      )
      .map((issue) => ({
        ...issue,
        conditionString: (
          conditions.find(({ dbValue }) => dbValue === issue.condition) || {
            value: "possessed",
          }
        ).value,
      }));

    await coa().fetchIssueNumbersWithTitles(publicationcode);

    const coaIssues = coa().issuesWithTitles[publicationcode];
    if (groupUserCopies) {
      issues = coaIssues.map((issue) => ({
        ...issue,
        userCopies: userIssuesForPublication!.filter(
          ({ issuenumber: userIssueNumber }) =>
            userIssueNumber === issue.issuenumber
        ),
        key: issue.issuenumber,
      }));
    } else {
      const userIssueNumbers = [
        ...new Set(
          userIssuesForPublication!.map(({ issuenumber }) => issuenumber)
        ),
      ];
      issues = coaIssues
        .filter(({ issuenumber }) => userIssueNumbers.includes(issuenumber))
        .map(({ issuenumber }) => issuenumber)
        .reduce(
          (acc, issuenumber) => [
            ...acc,
            ...userIssuesForPublication!
              .filter(
                ({ issuenumber: userIssueNumber }) =>
                  userIssueNumber === issuenumber
              )
              .map((issue) => ({
                ...issue,
                key: `${issue.issuenumber}-id-${issue.id}`,
                userCopies: [issue],
              })),
          ],
          [] as issueWithPublicationCodeAndCopies[]
        );
    }

    if (duplicatesOnly) {
      const countPerIssueNumber = issues!.reduce(
        (acc, { userCopies }) => ({
          ...acc,
          [userCopies[0].issuenumber]:
            (acc[userCopies[0].issuenumber] || 0) + 1,
        }),
        {} as { [issuenumber: string]: number }
      );
      issues = issues!.filter(
        ({ issuenumber }) => countPerIssueNumber[issuenumber] > 1
      );
    }

    if (readStackOnly) {
      issues = issues!.filter(
        ({ userCopies }) => userCopies.filter(({ isToRead }) => isToRead).length
      );
    }
    if (onSaleStackOnly) {
      issues = issues!.filter(
        ({ userCopies }) => userCopies.filter(({ isOnSale }) => isOnSale).length
      );
    }

    const coaIssueNumbers = coa().issuesWithTitles[publicationcode].map(
      ({ issuenumber }) => issuenumber
    );
    userIssuesNotFoundForPublication = userIssuesForPublication!.filter(
      ({ issuenumber }) => !coaIssueNumbers.includes(issuenumber)
    );
    loading = false;
  }
};

watch(
  () => preselectedIndexEnd,
  () => {
    preselected = getPreselected();
  }
);

watch(
  () => publicationcode,
  async () => {
    await loadIssues();
  }
);

watch(
  () => userIssues,
  async () => {
    await loadIssues();
  },
  { immediate: true }
);

onMounted(async () => {
  if (customIssues) {
    collectionStore().purchases = [];
  } else {
    await loadPurchases();
  }
  await fetchPublicationNames([publicationcode]);
  publicationNameLoading = false;
});
</script>

<style scoped lang="scss">
.issue-list-header {
  border: 0;
  width: 100%;
}

.issue-filter {
  float: right;
  white-space: nowrap;

  * {
    font-size: 11px;
  }

  tr td:nth-child(2) {
    text-align: right;
  }
}

.issue-list {
  clear: both;
  user-select: none;

  .issue {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: black;
    cursor: default;
    min-height: 21px;

    .popper {
      display: none;
    }

    &:hover {
      background-color: #333;

      .popper {
        display: initial;
      }
    }

    &.preselected {
      opacity: 0.7;
      filter: alpha(opacity=70);
    }

    &.selected {
      background-repeat: no-repeat;
      background-position: right center;
      outline: 1px solid white;
    }

    &.issue-possessed {
      background-color: rgb(200, 137, 100);

      &:hover {
        background-color: rgb(162, 133, 117);
      }
    }

    .issue-text {
      font-weight: bold;
    }

    .issue-title {
      font-weight: normal;
    }

    .issue-details-wrapper {
      display: flex;
      align-items: center;
      padding-right: 20px;

      :deep(.watch) {
        margin-right: 11px;
      }

      .issue-check {
        width: 15px;
        height: 15px;
        margin-right: 5px;
      }

      .issue-copies {
        display: flex;
        flex-direction: column;
        align-items: end;
        margin-right: 10px;

        .issue-copy {
          display: inline-flex;
          justify-content: flex-end;
          align-items: center;
          height: 21px;
          padding: 1px;

          .issue-purchase-date,
          .issue-condition,
          .issue-to-read {
            width: 14px;
            height: 14px;
            margin-right: 8px;
          }

          .issue-condition {
            display: inline-block;
            border-radius: 50%;
          }
        }
      }
    }
  }
}

@media (max-width: 767px) {
  .issue-text {
    white-space: nowrap;
    max-width: 170px;
    overflow-x: hidden;
  }

  .issue-details-wrapper {
    padding-right: 0;
  }
}
</style>
