<template>
  <div v-if="publicationName" class="mt-4">
    <Publication
      size="xl"
      :publicationcode="publicationcode"
      :publicationname="publicationName"
    />
    <div v-if="issues && purchases">
      <div v-if="!duplicatesOnly" v-once class="issue-filter">
        <table>
          <tr
            v-for="conditionFilter in ['possessed', 'missing']"
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
      <div
        class="issue-list"
        @contextmenu.prevent="openContextMenuIfBookNotOpen"
      >
        <b-alert
          v-if="userIssuesNotFoundForPublication.length"
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
              :key="`notfound-${issueNotFound.issueNumber}`"
            >
              {{ $t("n°") }}{{ issueNotFound.issueNumber }}
              <b-button
                size="sm"
                @click="deletePublicationIssues([issueNotFound])"
              >
                {{ $t("Supprimer") }}
              </b-button>
            </li>
          </ul>
        </b-alert>
        <b-alert v-if="!duplicatesOnly" v-once show variant="info" class="mb-0">
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
          :publication-code="currentIssueOpened.publicationcode"
          :issue-number="currentIssueOpened.issueNumber"
          @close-book="currentIssueOpened = null"
        />
        <div v-contextmenu:contextmenu>
          <div
            v-for="({ issueNumber, title, userCopies }, idx) in filteredIssues"
            :key="issueNumber"
            :class="{
              issue: true,
              [`issue-${userCopies.length ? 'possessed' : 'missing'}`]: true,
              preselected: preselected.includes(issueNumber),
              selected: selected.includes(issueNumber),
            }"
            :name="issueNumber"
            @mousedown.self.left="
              preselectedIndexStart = preselectedIndexEnd = idx
            "
            @mouseup.self.left="updateSelected"
            @mouseover="
              preselectedIndexEnd = preselectedIndexStart === null ? null : idx
            "
          >
            <span>
              <a :name="issueNumber" />
              <b-icon-eye-fill
                v-once
                :id="`issue-details-${issueNumber}`"
                :class="{
                  'mx-2': true,
                  [`can-show-book-${hoveredIssueHasCover}`]: true,
                }"
                :alt="viewText"
                @mouseover="hoveredIssueNumber = issueNumber"
                @mouseout="
                  hoveredIssueNumber = null;
                  hoveredIssueHasCover = undefined;
                "
                @click.prevent="
                  currentIssueOpened = hoveredIssueHasCover
                    ? { publicationcode, issueNumber }
                    : null
                "
              />
              <span class="issue-text">
                {{ issueNumberTextPrefix }}{{ issueNumber }}
                <span class="issue-title">{{ title }}</span>
              </span>
            </span>
            <div class="issue-details-wrapper">
              <div class="issue-copies">
                <div
                  v-for="(
                    { condition: copyCondition, purchaseId }, copyIndex
                  ) in userCopies"
                  :key="`${issueNumber}-copy-${copyIndex}`"
                  class="issue-copy"
                >
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
                      {{ purchases.find(({ id }) => id === purchaseId).date }}
                    </title>
                    <path
                      d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"
                    ></path>
                  </svg>
                  <Condition
                    v-if="copyCondition"
                    :publicationcode="publicationcode"
                    :issuenumber="issueNumber"
                    :value="copyCondition"
                  />
                </div>
              </div>
              <div class="issue-check">
                <input
                  type="checkbox"
                  disabled
                  :checked="selected.includes(issueNumber)"
                  @click.prevent="false"
                />
              </div>
            </div>
          </div>
          <IssueDetailsPopover
            v-if="hoveredIssueNumber"
            :publication-code="publicationcode"
            :issue-number="hoveredIssueNumber"
            placement="right"
            @cover-loaded="hoveredIssueHasCover = $event"
          />
        </div>
      </div>
    </div>
    <div v-else-if="loading">
      {{ $t("Chargement...") }}
    </div>
  </div>
  <div v-else-if="!publicationNameLoading && issues && !issues.length">
    <b-alert variant="danger" show>
      <div class="mb-4">
        {{ $t("Aucun numéro n'est répertorié pour") }}
        {{ publicationcode.split("/")[1] }} ({{ $t("Pays de publication") }} :
        {{ country }})
      </div>
      <div v-if="userIssuesForPublication.length">
        {{
          $t(
            "Souhaitez-vous supprimer ce magazine de votre collection ? Les numéros suivants seront supprimés de votre collection dans ce cas :"
          )
        }}
        <ul>
          <li
            v-for="issue in userIssuesForPublication"
            :key="issue.issueNumber"
          >
            {{ issue.issueNumber }}
          </li>
        </ul>
        <b-button
          variant="danger"
          @click="deletePublicationIssues(userIssuesForPublication)"
        >
          {{ $t("Supprimer") }}
        </b-button>
      </div>
    </b-alert>
  </div>

  <v-contextmenu ref="contextmenu">
    <ContextMenu
      ref="contextMenu"
      :key="contextMenuKey"
      :publication-code="publicationcode"
      :selected-issues="selected"
      :copies="selectedIssuesCopies"
      @update-issues="updateIssues"
      @create-purchase="createPurchase"
      @delete-purchase="deletePurchase"
      @close="contextMenuKey = `context-menu-${Math.random()}`"
    />
  </v-contextmenu>
</template>

<script setup>
import axios from "axios";
import { BIconEyeFill } from "bootstrap-icons-vue";
import { BAlert } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import { condition } from "../composables/condition";
import { coa } from "../stores/coa";
import { collection as collectionStore } from "../stores/collection";
import Book from "./Book";
import Condition from "./Condition";
import ContextMenu from "./ContextMenu";
import IssueDetailsPopover from "./IssueDetailsPopover";
import Publication from "./Publication";

const { duplicatesOnly, publicationcode } = defineProps({
  publicationcode: {
    type: String,
    required: true,
  },
  duplicatesOnly: {
    type: Boolean,
    default: false,
  },
});

const { conditions } = condition(),
  { t: $t } = useI18n();

let loading = $ref(true),
  publicationNameLoading = $ref(true),
  filter = $ref({
    missing: true,
    possessed: true,
  }),
  contextmenu = $ref(null),
  issues = $shallowRef(null),
  userIssuesForPublication = $shallowRef(null),
  userIssuesNotFoundForPublication = $shallowRef([]),
  selected = $shallowRef([]),
  preselected = $shallowRef([]),
  preselectedIndexStart = $ref(null),
  preselectedIndexEnd = $ref(null),
  hoveredIssueNumber = $ref(null),
  hoveredIssueHasCover = $ref(undefined),
  currentIssueOpened = $shallowRef(null),
  issueNumberTextPrefix = $computed(() => $t("n°")),
  boughtOnTextPrefix = $computed(() => $t("Acheté le")),
  viewText = $computed(() => $t("Voir"));

const contextMenuKey = "context-menu",
  publicationNames = $computed(() => coa().publicationNames),
  userIssues = $computed(() => collectionStore().collection),
  purchases = $computed(() => collectionStore().purchases),
  country = $computed(() => publicationcode.split("/")[0]),
  publicationName = $computed(() => publicationNames[publicationcode]),
  isTouchScreen = window.matchMedia("(pointer: coarse)").matches,
  filteredIssues = $computed(() =>
    issues?.filter(
      ({ userCopies }) =>
        (filter.possessed && userCopies.length) ||
        (filter.missing && !userCopies.length)
    )
  ),
  selectedIssuesCopies = $computed(() =>
    userIssuesForPublication.filter(
      ({ issueNumber }, idx) =>
        selected.includes(issueNumber) &&
        (selected.length === 1 ||
          userIssuesForPublication.some(
            ({ issueNumber: issueNumber2 }, idx2) =>
              issueNumber2 === issueNumber && idx !== idx2
          ))
    )
  ),
  ownedIssuesCount = $computed(() =>
    issues.reduce((acc, { userCopies }) => acc + (userCopies.length ? 1 : 0), 0)
  ),
  fetchPublicationNames = coa().fetchPublicationNames,
  loadCollection = collectionStore().loadCollection,
  loadPurchases = collectionStore().loadPurchases,
  getPreselected = () =>
    [preselectedIndexStart, preselectedIndexEnd].includes(null)
      ? preselected
      : filteredIssues
          .map(({ issueNumber }) => issueNumber)
          .filter(
            (issueNumber, index) =>
              index >= preselectedIndexStart && index <= preselectedIndexEnd
          ),
  updateSelected = () => {
    selected = issues
      .map(({ issueNumber }) => issueNumber)
      .filter(
        (issueNumber) =>
          selected.includes(issueNumber) !== preselected.includes(issueNumber)
      );
    preselectedIndexStart = preselectedIndexEnd = null;
    preselected = [];
  },
  deletePublicationIssues = async (issuesToDelete) =>
    await updateIssues({
      publicationCode: publicationcode,
      issueNumbers: issuesToDelete.map(({ issueNumber }) => issueNumber),
      condition: conditions.find(({ value }) => value === "missing").dbValue,
      istosell: false,
      purchaseId: null,
    }),
  updateIssues = async (data) => {
    contextmenu.hide();
    await axios.post("/api/collection/issues", data);
    await loadCollection(true);
    selected = [];
  },
  createPurchase = async ({ date, description }) => {
    await axios.post("/api/collection/purchases", {
      date,
      description,
    });
    await loadPurchases(true);
  },
  deletePurchase = async ({ id }) => {
    await axios.delete(`/api/collection/purchases/${id}`);
    await loadPurchases(true);
  };

watch(
  () => preselectedIndexEnd,
  () => {
    preselected = getPreselected();
  }
);

watch(
  () => userIssues,
  async (newValue) => {
    if (newValue) {
      userIssuesForPublication = newValue
        .filter(
          (issue) => `${issue.country}/${issue.magazine}` === publicationcode
        )
        .map((issue) => ({
          ...issue,
          condition: (
            conditions.find(({ dbValue }) => dbValue === issue.condition) || {
              value: "possessed",
            }
          ).value,
        }));

      const issuesWithTitles = (
        await axios.get(
          `/api/coa/list/issues/withTitle/asArray/${publicationcode}`
        )
      ).data;

      issues = issuesWithTitles
        .map((issue) => ({
          ...issue,
          userCopies: userIssuesForPublication.filter(
            ({ issueNumber: userIssueNumber }) =>
              userIssueNumber === issue.issueNumber
          ),
        }))
        .filter(({ userCopies }) => !duplicatesOnly || userCopies.length > 1);
      const coaIssueNumbers = issuesWithTitles.map(
        ({ issueNumber }) => issueNumber
      );
      userIssuesNotFoundForPublication = userIssuesForPublication.filter(
        ({ issueNumber }) => !coaIssueNumbers.includes(issueNumber)
      );
      loading = false;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await loadPurchases();
  await fetchPublicationNames([publicationcode]);
  publicationNameLoading = false;
});
</script>

<style scoped lang="scss">
.can-show-book-undefined {
  cursor: initial;
}

.can-show-book-false {
  cursor: not-allowed;
}

.can-show-book-true {
  cursor: pointer;
}

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
    min-height: 20px;

    &:hover {
      opacity: 0.7;
      filter: alpha(opacity=70);
      -moz-opacity: 0.7;
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
    }

    .issue-title {
      color: #aaa;
    }

    .issue-details-wrapper {
      display: flex;
      align-items: center;
      padding-right: 20px;

      .issue-check {
        width: 15px;
        height: 15px;
        margin-right: 5px;
      }

      .issue-copies {
        margin-right: 10px;

        .issue-copy {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 20px;
          padding: 1px;

          .issue-purchase-date,
          .issue-condition {
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
