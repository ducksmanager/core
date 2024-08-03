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
              v-if="userIssuecodesNotFoundForPublication?.length"
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
                  v-for="issueNotFound in userIssuecodesNotFoundForPublication"
                  :key="`notfound-${issueNotFound}`"
                >
                  {{ $t("n°") }}{{ issueNotFound }}
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
            v-if="currentIssuecodeOpened"
            :issuecode="currentIssuecodeOpened"
            @close-book="currentIssuecodeOpened = null"
          />
          <div v-if="readonly">
            <div
              v-for="{
                issuecode,
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
                  :issuecode="issuecode"
                  @click="openBook(issuecode)"
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
                    :key="`${issuecode}-copy-${copyIndex}`"
                    class="issue-copy"
                  >
                    <Condition
                      v-if="copyCondition"
                      :issuecode="issuecode"
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
                issuecode,
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
                  :issuecode="issuecode"
                  @click="openBook(issuecode)"
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
                      :issuecode="issuecode"
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
                      v-bind="{ issuecode }"
                      :value="copyCondition"
                    />
                  </div>
                </div>
                <Watch
                  v-if="!readonly && (!userCopies.length || onSaleByOthers)"
                  v-bind="{ publicationcode, issuenumber }"
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
              :key="issueToDelete.issuecode"
            >
              {{ issueToDelete.issuecode }}
            </li>
          </ul>
          <b-button
            variant="danger"
            @click="deletePublicationIssues(userIssuesForPublication!.map(({ issuecode }) => issuecode))"
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
        :selected-issue-ids-by-issuecode="copiesBySelectedIssuecode"
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
                'launch-modal': launchModal,
              }
            : {}
        "
      />
    </v-contextmenu>
  </div>
</template>

<script setup lang="ts">
import type { issue } from "~prisma-clients/schemas/dm";

import ContextMenuOnSaleByOthers from "./ContextMenuOnSaleByOthers.vue";
import ContextMenuOwnCollection from "./ContextMenuOwnCollection.vue";

type simpleIssue = {
  issuecode: string;
  issuenumber: string;
  title?: string | null;
  key: string;
};
type issueWithCopies = simpleIssue & {
  userCopies: (issue & { copyIndex: number })[];
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
  customIssues?: issue[];
  onSaleByOthers?: boolean;
  groupUserCopies?: boolean;
  contextMenuComponentName?: "context-menu-on-sale-by-others";
  readonly?: boolean;
}>();

const { updateCollectionMultipleIssues, loadPurchases } = collection();
const { issues: collectionIssues, purchases: collectionPurchases } =
  storeToRefs(readonly ? publicCollection() : collection());

const { conditions } = useCondition();
const { t: $t } = useI18n();

let clicks = $ref(0);
let timer = $ref<NodeJS.Timeout | null>(null);
const doubleClickDelay = 500;

type LaunchModalOptions = {
  contactMethod: string;
  sellerId: number;
  selectedIssueIds: number[];
};

const emit = defineEmits<{
  (e: "launch-modal", options: LaunchModalOptions): void;
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

let hoveredIndex = $ref<number | null>(null);
let loading = $ref(true);
let publicationNameLoading = $ref(true);
const filter = $ref<{ missing: boolean; possessed: boolean }>({
  missing: true,
  possessed: true,
});
const contextmenuInstance = $ref<{
  visible: boolean;
  hide: (e?: MouseEvent) => void;
  show: (e: MouseEvent) => void;
} | null>(null);
let issues = $shallowRef<issueWithCopies[] | null>(null);
let userIssuesForPublication = $shallowRef<issue[] | null>(null);
let userIssuecodesNotFoundForPublication = $shallowRef<string[] | null>([]);
let selected = $shallowRef<string[]>([]);
const filteredUserCopies = $computed(() =>
  filteredIssues.reduce<issue[]>(
    (acc, { userCopies }) => [...acc, ...userCopies],
    [],
  ),
);
const copiesBySelectedIssuecode = $computed(() =>
  selected.reduce<{ [issuecode: string]: issue[] }>((acc, issueKey) => {
    const [issuecode, maybeIssueId] = issueKey.split("-id-");
    const issueId = (maybeIssueId && parseInt(maybeIssueId)) || null;
    return {
      ...acc,
      [issuecode]: [
        ...(acc[issuecode] || []),
        ...filteredUserCopies.filter(
          ({ id: copyId, issuecode: copyIssuecode }) =>
            issueId !== null
              ? issueId === copyId
              : issuecode.replaceAll("_", " ") === copyIssuecode,
        ),
      ],
    };
  }, {}),
);
let preselected = $shallowRef<string[]>([]);
let preselectedIndexStart = $ref<number | null>(null);
let preselectedIndexEnd = $ref<number | null>(null);
let currentIssuecodeOpened = $shallowRef<string | null>(null);
const issueNumberTextPrefix = $computed(() => $t("n°"));
const boughtOnTextPrefix = $computed(() => $t("Acheté le"));
const showFilter = $computed(
  () => !duplicatesOnly && !readStackOnly && !onSaleStackOnly,
);

const issueIds = $computed(() =>
  Object.values(copiesBySelectedIssuecode).reduce<number[]>(
    (acc, issues) => [...acc, ...issues.map(({ id }) => id)],
    [],
  ),
);

let contextMenuKey = $ref<string>("context-menu");
const userIssues = $computed(() => customIssues || collectionIssues.value);
let purchases = $computed(() => collectionPurchases.value);
const country = $computed(() => publicationcode.split("/")[0]);
const publicationName = $computed(
  () => publicationNames.value[publicationcode],
);
const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
const coaIssues = $computed(() => issuesWithTitles.value[publicationcode]);
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
  filteredIssues?.reduce<number[]>(
    (acc, { issuecode }, idx) => [
      ...acc,
      idx === 0
        ? 0
        : filteredIssues[idx - 1].issuecode === issuecode
          ? acc[idx - 1] + 1
          : 0,
    ],
    [],
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
const deletePublicationIssues = async (issuecodesToDelete: string[]) => {
  contextmenuInstance!.hide();
  if (!readonly) {
    await updateCollectionMultipleIssues({
      issuecodes: issuecodesToDelete,
      condition:
        conditions.find(({ dbValue }) => dbValue === null)?.dbValue ||
        "indefini",
      isToRead: false,
      isOnSale: false,
      purchaseId: null,
    });
    selected = [];
  }
};

const openBook = (issuecode: string) => {
  currentIssuecodeOpened = coverUrls.value?.[issuecode] ? issuecode : null;
};

const loadIssues = async () => {
  if (userIssues) {
    userIssuesForPublication = userIssues
      .filter(
        ({ publicationcode: issuePublicationcode }) =>
          issuePublicationcode === publicationcode,
      )
      .map((issue) => ({
        ...issue,
        conditionString: (
          conditions.find(({ dbValue }) => dbValue === issue.condition) || {
            value: "possessed",
          }
        ).dbValue,
      }));

    await fetchIssueNumbersWithTitles([publicationcode]);

    if (groupUserCopies) {
      issues = coaIssues.map((issue) => ({
        ...issue,
        userCopies: userIssuesForPublication!
          .filter(
            ({ issuecode: userIssuecode }) => userIssuecode === issue.issuecode,
          )
          .map((issue, copyIndex) => ({
            ...issue,
            copyIndex,
          })),
        key: issue.issuecode,
      }));
    } else {
      const userIssuecodes = [
        ...new Set(userIssuesForPublication!.map(({ issuecode }) => issuecode)),
      ];
      issues = coaIssues
        .filter(({ issuecode }) => userIssuecodes.includes(issuecode))
        .reduce<issueWithCopies[]>(
          (acc, { issuecode, issuenumber }) => [
            ...acc,
            ...userIssuesForPublication!
              .filter(
                ({ issuecode: userIssuecode }) => userIssuecode === issuecode,
              )
              .map((issue) => ({
                ...issue,
                issuenumber,
                key: `${issue.issuecode.replaceAll(" ", "_")}-id-${issue.id}`,
                userCopies: [{ ...issue, copyIndex: 0 }],
              })),
          ],
          [],
        );
    }

    if (duplicatesOnly) {
      const countPerIssuecode = issues!.reduce<{
        [issuenumber: string]: number;
      }>(
        (acc, { userCopies }) => ({
          ...acc,
          [userCopies[0].issuecode]: (acc[userCopies[0].issuecode] || 0) + 1,
        }),
        {},
      );
      issues = issues!.filter(
        ({ issuecode }) => countPerIssuecode[issuecode] > 1,
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

    const coaIssuecodes = issuesWithTitles.value[publicationcode].map(
      ({ issuecode }) => issuecode,
    );
    userIssuecodesNotFoundForPublication = userIssuesForPublication!
      .filter(({ issuecode }) => !coaIssuecodes.includes(issuecode))
      .map(({ issuecode }) => issuecode);
    loading = false;
  }
};

const launchModal = (event: LaunchModalOptions) => {
  emit("launch-modal", { ...event, selectedIssueIds: issueIds });
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
