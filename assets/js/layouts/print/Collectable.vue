<template>
  <div v-if="ready">
    <table class="collectable">
      <tr v-for="line in lines" :key="line">
        <td />
        <td v-for="subrange in numbersPerRow" :key="subrange">
          {{ (line - 1) * numbersPerRow + subrange }}
        </td>
        <td v-if="line === 1" :rowspan="lines" class="total_ligne">
          {{ $t("Total") }}
        </td>
      </tr>
      <template v-for="(_, publicationCode) in publicationNames">
        <tr v-for="line in lines" :key="`${publicationCode}-line${line}`">
          <td v-if="line === 1" :rowspan="lines + 1" class="libelle_ligne">
            <img
              :alt="publicationCode.split('/')[0]"
              :src="`${imagePath}/flags/${publicationCode.split('/')[0]}.png`"
            />
            <br />
            {{ publicationCode.split("/")[1] }}
            <br />
          </td>
          <td v-for="subrange in numbersPerRow" :key="subrange">
            <span
              v-for="letter in issuesPerCell[publicationCode][
                (line - 1) * numbersPerRow + subrange
              ]"
              :key="letter"
              class="letter"
              >{{ letter }}</span
            >
          </td>
          <td v-if="line === 1" class="total_ligne" :rowspan="lines + 1">
            {{ totalPerPublication[publicationCode] }}
          </td>
        </tr>
        <tr v-for="fakeloop in 1" :key="`${publicationCode}-${fakeloop}`">
          <td
            v-if="issuesPerCell[publicationCode]['non-numeric'].length"
            :colspan="numbersPerRow"
          >
            Autres :
            {{ issuesPerCell[publicationCode]["non-numeric"].join(", ") }}
          </td>
        </tr>
      </template>
    </table>
    <table class="legends">
      <tr>
        <td class="issue-legend">
          <table>
            <tr>
              <td align="center" colspan="6">
                <u>{{ issueCountTitle }}</u>
              </td>
            </tr>
            <tr
              v-for="(_, i) in Math.floor(letterToNumber(maxLetter) / 6) + 1"
              :key="i"
            >
              <td
                v-for="group in groupsInRange(i)"
                :key="group"
                class="issue-range"
              >
                <span v-if="Math.floor(group / 6) === i">
                  {{ numberToLetter(group) }}<br />{{ group * 100 + 1 }}-&gt;{{
                    (group + 1) * 100
                  }}
                </span>
              </td>
            </tr>
          </table>
        </td>
        <td class="publication-legend">
          <table>
            <tr>
              <td align="center" colspan="4">
                <u>{{ $t("Publications") }}</u>
              </td>
            </tr>
            <tr
              v-for="(publicationName, publicationCode) in publicationNames"
              :key="publicationCode"
            >
              <td>
                <Publication
                  :publicationcode="publicationCode"
                  :publicationname="`${
                    publicationCode.split('/')[1]
                  } : ${publicationName}`"
                />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup>
import Publication from "../../components/Publication";
import { coa } from "../../stores/coa";
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
const { collection: collectionStore } = require("../../stores/collection");

const doubleNumberRegex = /^(\d{1,2})(\d{2})-(\d{2})$/;

const lines = 2,
  numbersPerRow = 100 / lines,
  issuesPerCell = ref(null),
  countryNames = computed(() => coa().countryNames),
  publicationNames = computed(() => coa().publicationNames),
  collection = computed(() => collectionStore().collection),
  totalPerPublication = computed(() => collectionStore().totalPerPublication),
  ready = computed(
    () =>
      issuesPerCell.value &&
      countryNames.value &&
      Object.keys(publicationNames.value).length
  ),
  maxLetter = computed(() =>
    !issuesPerCell.value
      ? null
      : numberToLetter(
          [
            ...new Set(
              JSON.stringify(issuesPerCell.value)
                .match(/"[a-zA-Z]+"/g)
                .map((letter) => letter.replace(/"/g, ""))
            ),
          ]
            .map(letterToNumber)
            .sort((a, b) => b - a)[0]
        )
  ),
  { $t, $tc } = useI18n(),
  t = $t,
  issueCountTitle = computed(() => {
    const issueCountString = $tc("numéro | numéros", 2);
    return (
      issueCountString[0].toUpperCase() +
      issueCountString.substring(1, issueCountString.length).toLowerCase()
    );
  }),
  fetchCountryNames = coa().fetchCountryNames,
  fetchPublicationNames = coa().fetchPublicationNames,
  loadCollection = collectionStore().loadCollection,
  loadPurchases = collectionStore().loadPurchases,
  numberToLetter = (number) =>
    String.fromCharCode(
      (number < 26 ? "a".charCodeAt() : "A".charCodeAt() - 26) + number
    ),
  letterToNumber = (letter) =>
    letter >= "a"
      ? letter.charCodeAt() - "a".charCodeAt()
      : 26 + letter.charCodeAt() - "A".charCodeAt(),
  groupsInRange = (range) => {
    let groups = [];
    for (let group = 6 * range; group < 6 * (range + 1); group++) {
      groups.push(group);
    }
    return groups;
  };

watch(
  () => collection.value,
  (newCollectionValue) => {
    const addIssueToCell = (
      acc,
      publicationCode,
      issueNumber,
      isDoubleIssueStart,
      isDoubleIssueEnd
    ) => {
      let mod, number;
      if (Number.isNaN(issueNumber % 100)) {
        mod = "non-numeric";
        number = issueNumber;
      } else {
        mod = issueNumber % 100;
        number = (issueNumber - mod) / 100;
      }
      if (!acc[publicationCode]) {
        acc[publicationCode] = {
          "non-numeric": [],
        };
      }
      if (!acc[publicationCode][mod]) {
        acc[publicationCode][mod] = [];
      }

      acc[publicationCode][mod].push(
        [
          isDoubleIssueEnd ? "<" : "",
          typeof number === "string" ? number : numberToLetter(number),
          isDoubleIssueStart ? ">" : "",
        ].join("")
      );
    };
    issuesPerCell.value = newCollectionValue.reduce((acc, issue) => {
      const publicationCode = `${issue.country}/${issue.magazine}`;
      const issueNumber = issue.issueNumber;
      const doubleNumberMatch = issueNumber.match(doubleNumberRegex);
      if (
        doubleNumberMatch &&
        parseInt(doubleNumberMatch[2]) === parseInt(doubleNumberMatch[1]) + 1
      ) {
        const [, part1, issue1, issue2] = doubleNumberMatch;
        addIssueToCell(acc, publicationCode, `${part1}${issue1}`, true);
        addIssueToCell(acc, publicationCode, `${part1}${issue2}`, false, true);
      } else {
        addIssueToCell(acc, publicationCode, issueNumber);
      }
      return acc;
    }, {});
  }
);
watch(
  () => totalPerPublication.value,
  (newValue) => {
    fetchPublicationNames(Object.keys(newValue));
  }
);

onMounted(async () => {
  await loadCollection();
  await fetchCountryNames();
  await loadPurchases();
});
</script>

<style scoped lang="scss">
table {
  color: black;
  font: 11px/15px verdana, arial, sans-serif;

  &.collectable,
  &.legends {
    width: 90%;
  }
}

td {
  &.issue-legend,
  &.publication-legend {
    vertical-align: top;
    border-left: 1px solid gray;
    padding: 8px;

    .issue-range {
      border: 1px solid black;
      text-align: center;
    }
  }
}

table.collectable {
  border: solid 1px black;
  border-collapse: collapse;

  tr {
    height: 15px;

    &:empty {
      height: 0;
    }

    td {
      text-align: left;
      border: solid 1px black;
      vertical-align: top;
      min-width: 25px;
      max-width: 25px;
      word-wrap: break-word;

      &.libelle_ligne,
      &.total_ligne {
        text-align: center;
        vertical-align: middle;
        max-width: none;
        white-space: nowrap;
      }
    }
  }
}
</style>
