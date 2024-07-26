<route lang="yaml">
alias: [/impression/collectable]
meta:
  layout: bare
</route>

<template>
  <div v-if="ready">
    <print-header />
    <table v-if="issuesPerCell" class="collectable">
      <tr v-for="line in lines" :key="line">
        <td />
        <td v-for="subrange in numbersPerRow" :key="subrange">
          {{ (line - 1) * numbersPerRow + subrange }}
        </td>
        <td v-if="line === 1" :rowspan="lines" class="total_ligne">
          {{ $t("Total") }}
        </td>
      </tr>
      <template v-for="publicationcode of Object.keys(publicationNames)">
        <tr v-for="line in lines" :key="`${publicationcode}-line${line}`">
          <td v-if="line === 1" :rowspan="lines + 1" class="libelle_ligne">
            <img
              :alt="publicationcode.split('/')[0]"
              :src="getImagePath(`flags/${publicationcode.split('/')[0]}.png`)"
            />
            <br />
            {{ publicationcode.split("/")[1] }}
            <br />
          </td>
          <td v-for="subrange in numbersPerRow" :key="subrange">
            <span
              v-for="letter in issuesPerCell[publicationcode][
                (line - 1) * numbersPerRow + subrange
              ]"
              :key="letter"
              class="letter"
              >{{ letter }}</span
            >
          </td>
          <td v-if="line === 1" class="total_ligne" :rowspan="lines + 1">
            {{ totalPerPublication![publicationcode] }}
          </td>
        </tr>
        <tr v-for="fakeloop in 1" :key="`${publicationcode}-${fakeloop}`">
          <td
            v-if="issuesPerCell[publicationcode]['non-numeric'].length"
            :colspan="numbersPerRow"
          >
            Autres :
            {{ issuesPerCell[publicationcode]["non-numeric"].join(", ") }}
          </td>
        </tr>
      </template>
    </table>
    <table v-if="maxLetter" class="legends">
      <tr>
        <td class="issue-legend">
          <table>
            <tr>
              <td align="center" colspan="6">
                <u>{{ issueCountTitle }}</u>
              </td>
            </tr>
            <tr
              v-for="i of Object.keys(
                Math.floor(letterToNumber(maxLetter) / 6) + 1,
              ).map((number) => Number(number))"
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
              v-for="[publicationcode, publicationName] in Object.entries(
                publicationNames,
              )"
              :key="publicationcode"
            >
              <td>
                <Publication
                  :publicationcode="publicationcode"
                  :publicationname="`${
                    publicationcode.split('/')[1]
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

<script setup lang="ts">
const { getImagePath } = images();
const doubleNumberRegex = /^(\d{1,2})(\d{2})-(\d{2})$/;
const lines = 2;
const numbersPerRow = 100 / lines;

const { fetchCountryNames, fetchPublicationNames } = coa();
const { countryNames, publicationNames } = storeToRefs(coa());

const { loadCollection, loadPurchases } = collection();
const { issues, totalPerPublication } = storeToRefs(collection());

const ready = $computed(
  () => issuesPerCell && countryNames && Object.keys(publicationNames).length,
);
const maxLetter = $computed(() =>
  !issuesPerCell
    ? null
    : numberToLetter(
        [
          ...new Set(
            (JSON.stringify(issuesPerCell).match(/"[a-zA-Z]+"/g) || []).map(
              (letter) => letter.replace(/"/g, ""),
            ),
          ),
        ]
          .map(letterToNumber)
          .sort((a, b) => b - a)[0],
      ),
);
const { t: $t } = useI18n();
const issueCountTitle = $computed(() => {
  const issueCountString = $t("numéro | numéros", 2);
  return (
    issueCountString[0].toUpperCase() +
    issueCountString.substring(1, issueCountString.length).toLowerCase()
  );
});

const numberToLetter = (number: number) =>
  String.fromCharCode(
    (number < 26 ? "a".charCodeAt(0) : "A".charCodeAt(0) - 26) + number,
  );
const letterToNumber = (letter: string) =>
  letter >= "a"
    ? letter.charCodeAt(0) - "a".charCodeAt(0)
    : 26 + letter.charCodeAt(0) - "A".charCodeAt(0);
const groupsInRange = (range: number) => {
  const groups = [];
  for (let group = 6 * range; group < 6 * (range + 1); group++)
    groups.push(group);

  return groups;
};

let issuesPerCell = $ref(
  null as {
    [publicationcode: string]: { [mod: string | number]: string[] };
  } | null,
);

watch(issues, (newCollectionValue) => {
  if (!newCollectionValue) {
    return;
  }
  const addIssueToCell = (
    acc: { [publicationcode: string]: { [mod: string | number]: string[] } },
    publicationcode: string,
    shortIssuenumber: string,
    isDoubleIssueStart = false,
    isDoubleIssueEnd = false,
  ) => {
    let mod, number;
    if (Number.isNaN(shortIssuenumber)) {
      mod = "non-numeric";
      number = shortIssuenumber;
    } else {
      mod = parseInt(shortIssuenumber) % 100;
      number = (parseInt(shortIssuenumber) - mod) / 100;
    }
    if (!acc[publicationcode]) {
      acc[publicationcode] = {
        "non-numeric": [],
      };
    }
    if (!acc[publicationcode][mod]) acc[publicationcode][mod] = [];

    acc[publicationcode][mod].push(
      [
        isDoubleIssueEnd ? "<" : "",
        typeof number === "string" ? number : numberToLetter(number),
        isDoubleIssueStart ? ">" : "",
      ].join(""),
    );
  };
  issuesPerCell = newCollectionValue.reduce((acc, issue) => {
    const { publicationcode, shortIssuenumber } = issue;
    const doubleNumberMatch = shortIssuenumber!.match(doubleNumberRegex);
    if (
      doubleNumberMatch &&
      parseInt(doubleNumberMatch[2]) === parseInt(doubleNumberMatch[1]) + 1
    ) {
      const [, part1, issue1, issue2] = doubleNumberMatch;
      addIssueToCell(acc, publicationcode, `${part1}${issue1}`, true);
      addIssueToCell(acc, publicationcode, `${part1}${issue2}`, false, true);
    } else {
      addIssueToCell(acc, publicationcode, shortIssuenumber!);
    }
    return acc;
  }, {});
});
watch(totalPerPublication, (newValue) => {
  fetchPublicationNames(Object.keys(newValue || {}));
});

(async () => {
  await loadCollection();
  await fetchCountryNames();
  await loadPurchases();
})();
</script>

<style scoped lang="scss">
table {
  color: black;
  font:
    11px/15px verdana,
    arial,
    sans-serif;

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
