<template>
  <div @click="showContextMenuOnDoubleClickTouchScreen">
    <div class="mt-4">
      <Publication
        v-if="publicationName"
        size="xl"
        :publicationcode="publicationcode"
        :publicationname="publicationName"
      >
        <Watch
          v-if="!readonly && showFilter"
          class="ml-2"
          :publicationcode="publicationcode"
      /></Publication>
      <div v-if="issues && purchases">
        <div v-if="showFilter" v-once class="issue-filter">
          <table>
            <tr
              v-for="conditionFilter in ['possessed', 'missing'] as const"
              :key="conditionFilter"
            >
              <td>
                <input
                  :id="`show-${conditionFilter}`"
                  v-model="filter[conditionFilter]"
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
          <template v-if="!readonly">
            <b-alert
              v-if="userIssuesNotFoundForPublication?.length"
              :model-value="true"
              variant="warning"
            >
              {{
                $t(
                  "Certains des numéros que vous possédez pour ce magazine n'existent plus. Cela peut se produire lorsque des numéros ont été renommés. Pour chaque numéro n'existant plus, trouvez le numéro de remplacement, puis supprimez l'ancien numéro en cliquant sur le bouton correspondant ci-dessous.",
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
            <b-alert
              v-if="showFilter"
              v-once
              :model-value="true"
              variant="info"
              class="mb-0"
            >
              {{
                $t(
                  "Cliquez sur les numéros que vous souhaitez ajouter à votre collection,",
                )
              }}
              <b v-if="isTouchScreen">{{
                $t(
                  "puis tapotez deux fois au niveau de la liste pour indiquer leur état et validez.",
                )
              }}</b>
              <b v-else>{{
                $t(
                  "puis faites un clic droit pour indiquer leur état et validez.",
                )
              }}</b>
            </b-alert></template
          >
          <Book
            v-if="currentIssueOpened"
            :publicationcode="currentIssueOpened.publicationcode"
            :issuenumber="currentIssueOpened.issuenumber"
            @close-book="currentIssueOpened = null"
          />
          <div v-if="readonly">
            <div
              v-for="{
                issuenumber,
                title,
                userCopies,
                key,
                idx,
              } in filteredIssues"
              :id="key"
              :key="key"
              :class="`issue issue-${
                userCopies.length && !onSaleByOthers ? 'possessed' : 'missing'
              }`"
              @mouseover="hoveredIndex = idx"
            >
              <span>
                <IssueDetailsPopover
                  v-if="hoveredIndex === idx"
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
                <div class="issue-copies">
                  <div
                    v-for="{
                      condition: copyCondition,
                      copyIndex,
                    } in userCopies"
                    :key="`${issuenumber}-copy-${copyIndex}`"
                    class="issue-copy"
                  >
                    <!-- <MarketplaceSellerInfo
                      v-if="onSaleByOthers"
                      :publicationcode="publicationcode"
                      :issuenumber="issuenumber"
                      :copy-index="filteredIssuesCopyIndexes[idx]"
                    />
                    <MarketplaceBuyerInfo :issue-id="id" /> -->

                    <Condition
                      v-if="copyCondition"
                      :publicationcode="publicationcode"
                      :issuenumber="issuenumber"
                      :value="copyCondition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else v-contextmenu:contextmenuInstance>
            <div
              v-for="{
                issuenumber,
                title,
                userCopies,
                key,
                idx,
              } in filteredIssues"
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
                preselectedIndexEnd =
                  preselectedIndexStart === null ? null : idx;
                hoveredIndex = idx;
              "
            >
              <span>
                <IssueDetailsPopover
                  v-if="hoveredIndex === idx"
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
                <div class="issue-copies">
                  <div
                    v-for="{
                      condition: copyCondition,
                      isToRead,
                      purchaseId,
                      id,
                      copyIndex,
                    } in userCopies"
                    :key="`${issuenumber}-copy-${copyIndex}`"
                    class="issue-copy"
                  >
                    <MarketplaceSellerInfo
                      v-if="onSaleByOthers"
                      :publicationcode="publicationcode"
                      :issuenumber="issuenumber"
                      :copy-index="filteredIssuesCopyIndexes[idx]"
                    />
                    <MarketplaceBuyerInfo :issue-id="id" />
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
                        {{
                          purchases.find(({ id }) => id === purchaseId)!.date
                        }}
                      </title>
                      <path
                        d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"
                      />
                    </svg>
                    <i-bi-bookmark-check
                      v-if="isToRead && !onSaleByOthers"
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
                  v-if="!readonly && (!userCopies.length || onSaleByOthers)"
                  :publicationcode="publicationcode"
                  :issuenumber="issuenumber"
                  :constant-width="onSaleByOthers"
                />
                <div v-if="!readonly" class="issue-check">
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
      <b-alert variant="danger" :model-value="true">
        <div class="mb-4">
          {{ $t("Aucun numéro n'est répertorié pour") }}
          {{ publicationcode.split("/")[1] }} ({{ $t("Pays de publication") }} :
          {{ country }})
        </div>
        <div v-if="userIssuesForPublication?.length">
          {{
            $t(
              "Souhaitez-vous supprimer ce magazine de votre collection ? Les numéros suivants seront supprimés de votre collection dans ce cas :",
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

    <v-contextmenu v-if="!readonly" ref="contextmenuInstance">
      <component
        :is="contextMenuComponent"
        ref="contextMenu"
        :key="contextMenuKey"
        :publicationcode="publicationcode"
        :selected-issue-ids-by-issuenumber="copiesBySelectedIssuenumber"
        @clear-selection="
          contextmenuInstance!.hide();
          selected = [];
        "
        @close="
          contextMenuKey = `context-menu-${Math.random()}`;
          contextmenuInstance!.hide();
        "
        v-on="
          contextMenuComponentName === 'context-menu-on-sale-by-others'
            ? {
                'launch-modal': () =>
                  emit(
                    'launch-modal',
                    Object.assign({}, $event, { selectedIssueIds: issueIds }),
                  ),
              }
            : {}
        "
      />
    </v-contextmenu>
  </div>
</template>

<script setup lang="ts">
import condition from "~/composables/useCondition";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";
import type { issue as dm_issue } from "~prisma-clients/client_dm";

import ContextMenuOnSaleByOthers from "./ContextMenuOnSaleByOthers.vue";
import ContextMenuOwnCollection from "./ContextMenuOwnCollection.vue";

type simpleIssue = {
  issuenumber: string;
  title?: string | null;
  key: string;
};
type issueWithPublicationCodeAndCopies = simpleIssue & {
  userCopies: (dm_issue & { copyIndex: number; publicationcode: string })[];
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
  readonly = false,
} = defineProps<{
  publicationcode: string;
  duplicatesOnly?: boolean;
  readStackOnly?: boolean;
  onSaleStackOnly?: boolean;
  customIssues?: IssueWithPublicationcode[];
  onSaleByOthers?: boolean;
  groupUserCopies?: boolean;
  contextMenuComponentName?: "context-menu-on-sale-by-others";
  readonly?: boolean;
}>();

const { updateCollectionMultipleIssues, loadPurchases } = collection();
const { issues: collectionIssues, purchases: collectionPurchases } =
  storeToRefs(readonly ? publicCollection() : collection());

const { conditions } = condition();
const { t: $t } = useI18n();

let clicks = $ref(0);
let timer = $ref(null as NodeJS.Timeout | null);
const doubleClickDelay = 500;

const emit = defineEmits<{
  (
    e: "launch-modal",
    options: {
      contactMethod: string;
      sellerId: number;
      selectedIssueIds: number[];
    },
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

const { fetchPublicationNames, fetchIssueNumbersWithTitles } = coa();
const { publicationNames, coverUrls, issuesWithTitles } = storeToRefs(coa());

let hoveredIndex = $ref(null as number | null);
let loading = $ref(true as boolean);
let publicationNameLoading = $ref(true as boolean);
const filter = $ref({
  missing: true,
  possessed: true,
} as { missing: boolean; possessed: boolean });
const contextmenuInstance = $ref(
  null as {
    visible: boolean;
    hide: (e?: MouseEvent) => void;
    show: (e: MouseEvent) => void;
  } | null,
);
let issues = $shallowRef(null as issueWithPublicationCodeAndCopies[] | null);
let userIssuesForPublication = $shallowRef(
  null as IssueWithPublicationcode[] | null,
);
let userIssuesNotFoundForPublication = $shallowRef(
  [] as IssueWithPublicationcode[] | null,
);
let selected = $shallowRef([] as string[]);
const filteredUserCopies = $computed(() =>
  filteredIssues.reduce(
    (acc, { userCopies }) => [...acc, ...userCopies],
    [] as IssueWithPublicationcode[],
  ),
);
const copiesBySelectedIssuenumber = $computed(() =>
  selected.reduce(
    (acc, issueKey) => {
      const [issuenumber, maybeIssueId] = issueKey.split("-id-");
      const issueId = (maybeIssueId && parseInt(maybeIssueId)) || null;
      return {
        ...acc,
        [issuenumber]: [
          ...(acc[issuenumber] || []),
          ...filteredUserCopies.filter(
            ({ id: copyId, issuenumber: copyIssueNumber }) =>
              issueId !== null
                ? issueId === copyId
                : issuenumber === copyIssueNumber,
          ),
        ],
      };
    },
    {} as { [issuenumber: string]: IssueWithPublicationcode[] },
  ),
);
let preselected = $shallowRef([] as string[]);
let preselectedIndexStart = $ref(null as number | null);
let preselectedIndexEnd = $ref(null as number | null);
let currentIssueOpened = $shallowRef(
  null as { publicationcode: string; issuenumber: string } | null,
);
const issueNumberTextPrefix = $computed(() => $t("n°"));
const boughtOnTextPrefix = $computed(() => $t("Acheté le"));
const showFilter = $computed(
  () => !duplicatesOnly && !readStackOnly && !onSaleStackOnly,
);

const issueIds = $computed(() =>
  Object.values(
    copiesBySelectedIssuenumber as { [issuenumber: string]: { id: number }[] },
  ).reduce(
    (acc, issues) => [...acc, ...issues.map(({ id }) => id)],
    [] as number[],
  ),
);

let contextMenuKey = $ref("context-menu" as string);
const userIssues = $computed(() => customIssues || collectionIssues.value);
let purchases = $computed(() => collectionPurchases.value);
const country = $computed(() => publicationcode.split("/")[0]);
const publicationName = $computed(
  () => publicationNames.value[publicationcode],
);
const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
const filteredIssues = $computed(
  () =>
    issues
      ?.filter(
        ({ userCopies }) =>
          (filter.possessed && userCopies!.length) ||
          (filter.missing && !userCopies!.length),
      )
      ?.map((issue, idx) => ({ ...issue, idx })) || [],
);

const filteredIssuesCopyIndexes = $computed(() =>
  filteredIssues?.reduce(
    (acc, { issuenumber }, idx) => [
      ...acc,
      idx === 0
        ? 0
        : filteredIssues[idx - 1].issuenumber === issuenumber
          ? acc[idx - 1] + 1
          : 0,
    ],
    [] as number[],
  ),
);

const ownedIssuesCount = $computed(
  () =>
    issues?.reduce(
      (acc, { userCopies }) => acc + (userCopies.length ? 1 : 0),
      0,
    ) || 0,
);

const showContextMenuOnDoubleClickTouchScreen = (e: MouseEvent) => {
  if (!readonly) {
    clicks++;
    if (clicks === 1) {
      timer = setTimeout(() => {
        clicks = 0;
        contextmenuInstance!.hide(e);
      }, doubleClickDelay);
    } else if (clicks === 2) {
      clearTimeout(timer!);
      clicks = 0;
      contextmenuInstance!.show(e);
    }
  }
};

const getPreselected = () =>
  [preselectedIndexStart, preselectedIndexEnd].includes(null)
    ? preselected
    : filteredIssues
        .map(({ key }) => key || "")
        .filter(
          (_, index) =>
            preselectedIndexStart !== null &&
            preselectedIndexEnd !== null &&
            index >= preselectedIndexStart &&
            index <= preselectedIndexEnd,
        );
const updateSelected = () => {
  if (!contextmenuInstance?.visible) {
    selected = issues!
      .map(({ key }) => key || "")
      .filter(
        (itemKey) =>
          selected.includes(itemKey) !== preselected.includes(itemKey),
      );
    preselectedIndexStart = preselectedIndexEnd = null;
    preselected = [];
  }
};
const deletePublicationIssues = async (
  issuesToDelete: IssueWithPublicationcode[],
) => {
  contextmenuInstance!.hide();
  if (!readonly) {
    await updateCollectionMultipleIssues({
      publicationcode,
      issuenumbers: issuesToDelete.map(({ issuenumber }) => issuenumber),
      condition:
        conditions.find(({ value }) => value === null)?.dbValue || "indefini",
      isToRead: false,
      isOnSale: false,
      purchaseId: null,
    });
    selected = [];
  }
};

const openBook = (issuenumber: string) => {
  currentIssueOpened = coverUrls.value?.[issuenumber]
    ? { publicationcode: publicationcode, issuenumber }
    : null;
};

const loadIssues = async () => {
  if (userIssues) {
    userIssuesForPublication = userIssues
      .filter(
        ({ country, magazine }) => `${country}/${magazine}` === publicationcode,
      )
      .map((issue) => ({
        ...issue,
        conditionString: (
          conditions.find(({ dbValue }) => dbValue === issue.condition) || {
            value: "possessed",
          }
        ).value,
      }));

    await fetchIssueNumbersWithTitles(publicationcode);

    const coaIssues = issuesWithTitles.value[publicationcode];
    if (groupUserCopies) {
      issues = coaIssues.map((issue) => ({
        ...issue,
        userCopies: userIssuesForPublication!
          .filter(
            ({ issuenumber: userIssueNumber }) =>
              userIssueNumber === issue.issuenumber,
          )
          .map((issue, copyIndex) => ({
            ...issue,
            publicationcode: `${issue.country}/${issue.magazine}`,
            copyIndex,
          })),
        key: issue.issuenumber,
      }));
    } else {
      const userIssueNumbers = [
        ...new Set(
          userIssuesForPublication!.map(({ issuenumber }) => issuenumber),
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
                  userIssueNumber === issuenumber,
              )
              .map((issue) => ({
                ...issue,
                publicationcode: `${issue.country}/${issue.magazine}`,
                key: `${issue.issuenumber}-id-${issue.id}`,
                userCopies: [{ ...issue, copyIndex: 0 }],
              })),
          ],
          [] as issueWithPublicationCodeAndCopies[],
        );
    }

    if (duplicatesOnly) {
      const countPerIssueNumber = issues!.reduce(
        (acc, { userCopies }) => ({
          ...acc,
          [userCopies[0].issuenumber]:
            (acc[userCopies[0].issuenumber] || 0) + 1,
        }),
        {} as { [issuenumber: string]: number },
      );
      issues = issues!.filter(
        ({ issuenumber }) => countPerIssueNumber[issuenumber] > 1,
      );
    }

    if (readStackOnly) {
      issues = issues!.filter(
        ({ userCopies }) =>
          userCopies.filter(({ isToRead }) => isToRead).length,
      );
    }
    if (onSaleStackOnly) {
      issues = issues!.filter(
        ({ userCopies }) =>
          userCopies.filter(({ isOnSale }) => isOnSale).length,
      );
    }

    const coaIssueNumbers = issuesWithTitles.value[publicationcode].map(
      ({ issuenumber }) => issuenumber,
    );
    userIssuesNotFoundForPublication = userIssuesForPublication!.filter(
      ({ issuenumber }) => !coaIssueNumbers.includes(issuenumber),
    );
    loading = false;
  }
};

watch($$(preselectedIndexEnd), () => {
  preselected = getPreselected();
});

watch(
  [$$(publicationcode), $$(userIssues)],
  async () => {
    await loadIssues();
  },
  { immediate: true },
);

watch(
  $$(userIssues),
  async () => {
    await loadIssues();
  },
  { immediate: true },
);

(async () => {
  if (customIssues) {
    collectionPurchases.value = [];
  } else {
    await loadPurchases();
  }
  await fetchPublicationNames([publicationcode]);
  publicationNameLoading = false;
})();
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
