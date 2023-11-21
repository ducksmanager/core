<template>
  <nav class="navbar navbar-expand-lg navbar-dark position-sticky">
    <div class="container-fluid">
      <div v-if="withTitle" class="navbar-brand">
        {{ $t("Rechercher une histoire") }}
      </div>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <b-dropdown
            class="dropdown search-type"
            :text="searchContexts[searchContext as 'story' | 'storycode']"
          >
            <b-dropdown-item
              v-for="(
                l10nKey, alternativeSearchContext
              ) in searchContextsWithoutCurrent"
              :key="alternativeSearchContext"
              @click="
                searchContext = alternativeSearchContext as
                  | 'story'
                  | 'storycode';
                search = '';
              "
            >
              {{ l10nKey }}
            </b-dropdown-item>
          </b-dropdown>
          <b-form-input
            v-model="search"
            list="search"
            :placeholder="
              searchContext === 'story'
                ? $t('Rechercher une histoire')
                : $t(
                    `Rechercher les publications d'une histoire à partir d'un code histoire`,
                  )
            "
          />
          <datalist v-if="searchResults.results && !isSearching">
            <option v-if="!searchResults.results.length">
              {{ $t("Aucun résultat.") }}
            </option>
            <template v-if="!isSearchByCode">
              <option
                v-for="searchResult in searchResults.results as typeof issueResults.results"
                :key="searchResult!.storycode"
                class="d-flex align-items-center"
                @click="selectSearchResult(searchResult!)"
              >
                <Condition
                  v-if="searchResult!.collectionIssue"
                  :value="
                    conditions.find(
                      ({ dbValue }) =>
                        dbValue === searchResult!.collectionIssue.condition,
                    )?.value || undefined
                  "
                />&nbsp;{{ searchResult!.title }}
              </option>
            </template>
            <template v-else>
              <option
                v-for="searchResult in searchResults.results as typeof storyResults.results"
                :key="searchResult!.storycode"
                class="d-flex align-items-center"
                @click="selectSearchResult(searchResult!)"
              >
                <Issue
                  v-if="publicationNames[searchResult.publicationcode]"
                  :publicationcode="searchResult.publicationcode"
                  :publicationname="
                    publicationNames[searchResult.publicationcode]!
                  "
                  :issuenumber="searchResult.issuenumber"
                  :clickable="withStoryLink"
                /></option
            ></template>
          </datalist>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import axios from "axios";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import condition from "~/composables/useCondition";
import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { publicCollection } from "~/stores/public-collection";
import { GET__coa__list__issues__by_storycode } from "~api-routes";
import { call } from "~axios-helper";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";
import { SimpleIssue } from "~dm-types/SimpleIssue";
import { SimpleStory } from "~dm-types/SimpleStory";

const {
  withTitle = true,
  withStoryLink = true,
  isPublic = false,
} = defineProps<{
  withTitle?: boolean;
  withStoryLink?: boolean;
  isPublic?: boolean;
}>();
const emit = defineEmits<{
  (e: "issue-selected", story: SimpleIssue): void;
}>();
const { conditions } = condition();

const store = $computed(() => (isPublic ? publicCollection() : collection()));

let isSearching = $ref(false as boolean);
let pendingSearch = $ref(null as string | null);
let search = $ref("" as string);
let storyResults = $ref(
  {} as {
    results: (SimpleStory & {
      collectionIssue: IssueWithPublicationcode | null;
    })[];
    hasMore: boolean;
  },
);
let issueResults = $ref({} as { results: SimpleIssue[] });
let searchContext = $ref("story" as "story" | "storycode");

const publicationNames = $computed(() => coa().publicationNames);
const { t: $t } = useI18n();
const fetchPublicationNames = coa().fetchPublicationNames;
const isInCollection = ({ publicationcode, issuenumber }: SimpleIssue) =>
  store.findInCollection(publicationcode, issuenumber) !== undefined;

const searchContexts = {
  story: $t("titre d'histoire"),
  storycode: $t("code histoire"),
} as { story: string; storycode: string };
const searchContextsWithoutCurrent = $computed(
  (): { [searchContext: string]: { [key: string]: string } } =>
    Object.keys(searchContexts)
      .filter((currentSearchContext) => currentSearchContext !== searchContext)
      .reduce(
        (acc, currentSearchContext) => ({
          ...acc,
          [currentSearchContext]:
            searchContexts[currentSearchContext as "story" | "storycode"],
        }),
        {},
      ),
);
const isSearchByCode = $computed(() => searchContext === "storycode");
const searchResults = $computed(() =>
  isSearchByCode ? issueResults : storyResults,
);
const selectSearchResult = (searchResult: SimpleStory | SimpleIssue) => {
  if (isSearchByCode) {
    emit("issue-selected", searchResult as SimpleIssue);
  } else {
    searchContext = "storycode";
    search = (searchResult as SimpleStory).storycode;
  }
};
const runSearch = async (value: string) => {
  isSearching = true;
  try {
    if (isSearchByCode) {
      const data = (
        await call(
          axios,
          new GET__coa__list__issues__by_storycode({
            query: { storycode: value.replace(/^code=/, "") },
          }),
        )
      ).data;
      issueResults = {
        results: data.sort((issue1, issue2) =>
          Math.sign(
            (isInCollection(issue2) ? 1 : 0) - (isInCollection(issue1) ? 1 : 0),
          ),
        ),
      };
      await fetchPublicationNames(
        issueResults.results.map(({ publicationcode }) => publicationcode),
      );
    } else {
      const data = {
        results: [
          {
            storycode: "I TL 2600-6",
            title: "Double jeu double jeu double jeu double jeu",
            score: 44.190120697021484,
            issues: [
              {
                code: "fr/MP  305",
                publicationcode: "fr/MP",
                issuenumber: "305",
              },
              {
                code: "fr/MPHS  10",
                publicationcode: "fr/MPHS",
                issuenumber: "10",
              },
              {
                code: "gr/MM 2253",
                publicationcode: "gr/MM",
                issuenumber: "2253",
              },
              {
                code: "it/RTL 259",
                publicationcode: "it/RTL",
                issuenumber: "259",
              },
              {
                code: "it/TL 2600",
                publicationcode: "it/TL",
                issuenumber: "2600",
              },
            ],
          },
          {
            storycode: "F JM 2525-1",
            title: "Double or nothing - Quitte ou double",
            score: 22.095060348510742,
            issues: [
              {
                code: "fr/ALJM 190",
                publicationcode: "fr/ALJM",
                issuenumber: "190",
              },
              {
                code: "fr/ALJM 218",
                publicationcode: "fr/ALJM",
                issuenumber: "218",
              },
              {
                code: "fr/JM 2525",
                publicationcode: "fr/JM",
                issuenumber: "2525",
              },
              {
                code: "fr/JM 2856",
                publicationcode: "fr/JM",
                issuenumber: "2856",
              },
            ],
          },
          {
            storycode: "KJZ 156",
            title: "Double Scoop, Double Take",
            score: 22.095060348510742,
            issues: [
              {
                code: "de/L1995-07",
                publicationcode: "de/L",
                issuenumber: "1995-07",
              },
              {
                code: "us/DA 4-10",
                publicationcode: "us/DA",
                issuenumber: "4-10",
              },
            ],
          },
          {
            storycode: "F JM 2432-1",
            title: "Double standard - Double standard",
            score: 22.095060348510742,
            issues: [
              {
                code: "es/TDP 12",
                publicationcode: "es/TDP",
                issuenumber: "12",
              },
              {
                code: "fr/ALJM 183",
                publicationcode: "fr/ALJM",
                issuenumber: "183",
              },
              {
                code: "fr/ALJM 213",
                publicationcode: "fr/ALJM",
                issuenumber: "213",
              },
              {
                code: "fr/ALJM 230",
                publicationcode: "fr/ALJM",
                issuenumber: "230",
              },
              {
                code: "fr/JM 2432",
                publicationcode: "fr/JM",
                issuenumber: "2432",
              },
              {
                code: "fr/JM 2796",
                publicationcode: "fr/JM",
                issuenumber: "2796",
              },
              {
                code: "fr/JM 2994",
                publicationcode: "fr/JM",
                issuenumber: "2994",
              },
            ],
          },
          {
            storycode: "F JM 00203",
            title: "Le doublé doublé",
            score: 22.095060348510742,
            issues: [
              {
                code: "fi/AAJ 27",
                publicationcode: "fi/AAJ",
                issuenumber: "27",
              },
              {
                code: "fi/AAX2012-03",
                publicationcode: "fi/AAX",
                issuenumber: "2012-03",
              },
              {
                code: "fi/TL2023",
                publicationcode: "fi/TL",
                issuenumber: "2023",
              },
              {
                code: "fr/JM 2490",
                publicationcode: "fr/JM",
                issuenumber: "2490",
              },
              {
                code: "fr/MP  295",
                publicationcode: "fr/MP",
                issuenumber: "295",
              },
              {
                code: "gr/MIK 464",
                publicationcode: "gr/MIK",
                issuenumber: "464",
              },
            ],
          },
          {
            storycode: "D 2015-174",
            title: "分身术 Double Double",
            score: 22.095060348510742,
            issues: [
              {
                code: "cn/MC2019-20",
                publicationcode: "cn/MC",
                issuenumber: "2019-20",
              },
              {
                code: "de/MMC 62",
                publicationcode: "de/MMC",
                issuenumber: "62",
              },
              {
                code: "gr/SMB  74",
                publicationcode: "gr/SMB",
                issuenumber: "74",
              },
              {
                code: "nl/DD2019-50",
                publicationcode: "nl/DD",
                issuenumber: "2019-50",
              },
              {
                code: "no/DD2017-39",
                publicationcode: "no/DD",
                issuenumber: "2017-39",
              },
              {
                code: "se/KA2017-39",
                publicationcode: "se/KA",
                issuenumber: "2017-39",
              },
            ],
          },
          {
            storycode: "S 69036",
            title: "Le double secret",
            score: 19.690486907958984,
            issues: [
              {
                code: "au/MS 165",
                publicationcode: "au/MS",
                issuenumber: "165",
              },
              {
                code: "br/DE   32",
                publicationcode: "br/DE",
                issuenumber: "32",
              },
              {
                code: "br/DER   28",
                publicationcode: "br/DER",
                issuenumber: "28",
              },
              {
                code: "br/DESP    0",
                publicationcode: "br/DESP",
                issuenumber: "0",
              },
              {
                code: "br/MGD   10",
                publicationcode: "br/MGD",
                issuenumber: "10",
              },
              {
                code: "br/NDE    7",
                publicationcode: "br/NDE",
                issuenumber: "7",
              },
              {
                code: "br/PD  950",
                publicationcode: "br/PD",
                issuenumber: "950",
              },
              {
                code: "fr/ALJM 103",
                publicationcode: "fr/ALJM",
                issuenumber: "103",
              },
              {
                code: "fr/DM 83-03",
                publicationcode: "fr/DM",
                issuenumber: "83-03",
              },
              {
                code: "fr/JM 1594",
                publicationcode: "fr/JM",
                issuenumber: "1594",
              },
              {
                code: "fr/PM  137",
                publicationcode: "fr/PM",
                issuenumber: "137",
              },
              {
                code: "gr/MIK 220",
                publicationcode: "gr/MIK",
                issuenumber: "220",
              },
              {
                code: "gr/MIK 354",
                publicationcode: "gr/MIK",
                issuenumber: "354",
              },
              {
                code: "gr/MIK  64",
                publicationcode: "gr/MIK",
                issuenumber: "64",
              },
              {
                code: "it/AT  157",
                publicationcode: "it/AT",
                issuenumber: "157",
              },
              {
                code: "nl/DD1971-10",
                publicationcode: "nl/DD",
                issuenumber: "1971-10",
              },
              {
                code: "pt/DE   13",
                publicationcode: "pt/DE",
                issuenumber: "13",
              },
              {
                code: "pt/DER   9",
                publicationcode: "pt/DER",
                issuenumber: "9",
              },
              {
                code: "pt/DESS  14",
                publicationcode: "pt/DESS",
                issuenumber: "14",
              },
            ],
          },
          {
            storycode: "I TL  116-AP",
            title: "Mickey et le double secret du Fantôme Noir",
            score: 19.690486907958984,
            issues: [
              {
                code: "br/DB   49",
                publicationcode: "br/DB",
                issuenumber: "49",
              },
              {
                code: "de/FAZTB 16",
                publicationcode: "de/FAZTB",
                issuenumber: "16",
              },
              {
                code: "de/FGL  5",
                publicationcode: "de/FGL",
                issuenumber: "5",
              },
              {
                code: "de/HOF 11",
                publicationcode: "de/HOF",
                issuenumber: "11",
              },
              {
                code: "de/LTB  62",
                publicationcode: "de/LTB",
                issuenumber: "62",
              },
              {
                code: "de/LTBM  3",
                publicationcode: "de/LTBM",
                issuenumber: "3",
              },
              {
                code: "de/LTBN  62",
                publicationcode: "de/LTBN",
                issuenumber: "62",
              },
              {
                code: "dk/HOF  12",
                publicationcode: "dk/HOF",
                issuenumber: "12",
              },
              {
                code: "dk/JT   36",
                publicationcode: "dk/JT",
                issuenumber: "36",
              },
              {
                code: "es/DMF  0",
                publicationcode: "es/DMF",
                issuenumber: "0",
              },
              {
                code: "es/DMF  1",
                publicationcode: "es/DMF",
                issuenumber: "1",
              },
              {
                code: "fi/AAL2017-38",
                publicationcode: "fi/AAL",
                issuenumber: "2017-38",
              },
              {
                code: "fi/AATK 55",
                publicationcode: "fi/AATK",
                issuenumber: "55",
              },
              {
                code: "fi/AATX 1998",
                publicationcode: "fi/AATX",
                issuenumber: "1998",
              },
              { code: "fi/TKS 3", publicationcode: "fi/TKS", issuenumber: "3" },
              {
                code: "fr/IRS   1",
                publicationcode: "fr/IRS",
                issuenumber: "1",
              },
              {
                code: "fr/MP  217",
                publicationcode: "fr/MP",
                issuenumber: "217",
              },
              {
                code: "gr/KX   91",
                publicationcode: "gr/KX",
                issuenumber: "91",
              },
              {
                code: "gr/MID  17",
                publicationcode: "gr/MID",
                issuenumber: "17",
              },
              {
                code: "it/CCD  25",
                publicationcode: "it/CCD",
                issuenumber: "25",
              },
              {
                code: "it/CD    9",
                publicationcode: "it/CD",
                issuenumber: "9",
              },
              {
                code: "it/CFR   9",
                publicationcode: "it/CFR",
                issuenumber: "9",
              },
              {
                code: "it/CWD   2",
                publicationcode: "it/CWD",
                issuenumber: "2",
              },
              {
                code: "it/GCD 319",
                publicationcode: "it/GCD",
                issuenumber: "319",
              },
              {
                code: "it/GSD   1",
                publicationcode: "it/GSD",
                issuenumber: "1",
              },
              {
                code: "it/MDCS 28",
                publicationcode: "it/MDCS",
                issuenumber: "28",
              },
              {
                code: "it/PD   29",
                publicationcode: "it/PD",
                issuenumber: "29",
              },
              {
                code: "it/SUD  83",
                publicationcode: "it/SUD",
                issuenumber: "83",
              },
              {
                code: "it/TL  116",
                publicationcode: "it/TL",
                issuenumber: "116",
              },
              {
                code: "it/TL  117",
                publicationcode: "it/TL",
                issuenumber: "117",
              },
              {
                code: "it/TL  118",
                publicationcode: "it/TL",
                issuenumber: "118",
              },
              {
                code: "it/TL  119",
                publicationcode: "it/TL",
                issuenumber: "119",
              },
              {
                code: "it/TM   39",
                publicationcode: "it/TM",
                issuenumber: "39",
              },
              {
                code: "nl/DUP 73",
                publicationcode: "nl/DUP",
                issuenumber: "73",
              },
              {
                code: "nl/PO2 30",
                publicationcode: "nl/PO2",
                issuenumber: "30",
              },
              {
                code: "no/HOF  12",
                publicationcode: "no/HOF",
                issuenumber: "12",
              },
              {
                code: "no/KDD  9",
                publicationcode: "no/KDD",
                issuenumber: "9",
              },
              {
                code: "no/TP2011-3",
                publicationcode: "no/TP",
                issuenumber: "2011-3",
              },
              {
                code: "pl/MGG  31",
                publicationcode: "pl/MGG",
                issuenumber: "31",
              },
              {
                code: "pt/HD 17-03",
                publicationcode: "pt/HD",
                issuenumber: "17-03",
              },
              {
                code: "se/HOF 12",
                publicationcode: "se/HOF",
                issuenumber: "12",
              },
              {
                code: "se/KAPS2011-03",
                publicationcode: "se/KAPS",
                issuenumber: "2011-03",
              },
              {
                code: "us/DMF  5",
                publicationcode: "us/DMF",
                issuenumber: "5",
              },
              {
                code: "us/FGL   5",
                publicationcode: "us/FGL",
                issuenumber: "5",
              },
              {
                code: "us/MAD   6",
                publicationcode: "us/MAD",
                issuenumber: "6",
              },
              {
                code: "us/MAD   7",
                publicationcode: "us/MAD",
                issuenumber: "7",
              },
              {
                code: "us/MAD   8",
                publicationcode: "us/MAD",
                issuenumber: "8",
              },
            ],
          },
          {
            storycode: "I FA   65-2",
            title: "A Far Too Secret Secret!",
            score: 17.285911560058594,
            issues: [
              {
                code: "it/FA   65",
                publicationcode: "it/FA",
                issuenumber: "65",
              },
              {
                code: "my/TB   35",
                publicationcode: "my/TB",
                issuenumber: "35",
              },
            ],
          },
          {
            storycode: "D 2016-034",
            title: "Le secret du plus secret des McDuck !",
            score: 17.285911560058594,
            issues: [
              {
                code: "br/TPCL   17",
                publicationcode: "br/TPCL",
                issuenumber: "17",
              },
              {
                code: "de/MMC 41",
                publicationcode: "de/MMC",
                issuenumber: "41",
              },
              {
                code: "dk/AA2017-36",
                publicationcode: "dk/AA",
                issuenumber: "2017-36",
              },
              {
                code: "fi/AA2017-36",
                publicationcode: "fi/AA",
                issuenumber: "2017-36",
              },
              {
                code: "fr/JM 3409",
                publicationcode: "fr/JM",
                issuenumber: "3409",
              },
              {
                code: "fr/PM  535",
                publicationcode: "fr/PM",
                issuenumber: "535",
              },
              {
                code: "gr/KXB  77",
                publicationcode: "gr/KXB",
                issuenumber: "77",
              },
              {
                code: "id/DB 1881",
                publicationcode: "id/DB",
                issuenumber: "1881",
              },
              {
                code: "it/ZPP  55",
                publicationcode: "it/ZPP",
                issuenumber: "55",
              },
              {
                code: "nl/EDS2018-05",
                publicationcode: "nl/EDS",
                issuenumber: "2018-05",
              },
              {
                code: "no/DD2017-36",
                publicationcode: "no/DD",
                issuenumber: "2017-36",
              },
              {
                code: "se/KA2017-36",
                publicationcode: "se/KA",
                issuenumber: "2017-36",
              },
            ],
          },
        ],
        hasMore: true,
      };
      storyResults.results = data.results.map((story) => ({
        ...story,
        collectionIssue:
          store.collection!.find(
            ({
              publicationcode: collectionPublicationCode,
              issuenumber: collectionIssueNumber,
            }) =>
              story
                .issues!.map(
                  ({ publicationcode, issuenumber }) =>
                    `${publicationcode}-${issuenumber}`,
                )
                .includes(
                  `${collectionPublicationCode}-${collectionIssueNumber}`,
                ),
          ) || null,
      }));
    }
  } finally {
    isSearching = false;
    // The input value as changed since the beginning of the search, searching again
    if (value !== pendingSearch && pendingSearch) {
      await runSearch(pendingSearch);
    }
  }
};

watch(
  () => search,
  async (newValue) => {
    if (newValue) {
      pendingSearch = newValue;
      if (!isSearching) await runSearch(newValue);
    }
  },
);

coa().fetchCountryNames();
</script>

<style scoped lang="scss">
.navbar {
  flex-flow: row nowrap;

  .navbar-brand {
    min-width: 120px;
  }

  .navbar-nav {
    flex-wrap: wrap;

    input {
      width: auto;
      margin: -1px 0px -1px 0px;
    }

    :deep(.dropdown.search-type) {
      position: absolute;
      width: 120px;

      .dropdown-menu {
        position: absolute;
        width: 100%;
        margin-top: 0;
        padding: 0;
        text-align: center;
      }

      ~ .form-control {
        padding-left: 135px;
      }

      ~ datalist {
        display: block;
        position: absolute;
        background: #eee;
        min-width: 275px;
        top: 36px;
        padding-left: 0;

        option {
          cursor: pointer;
          height: 26px;
          padding: 5px;
          overflow: auto;
          border-bottom: 1px solid #888;
          color: #888;

          :deep(a) {
            .issue-condition {
              display: inline-block;

              &:before {
                margin-top: -12px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
