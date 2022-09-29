<route lang="yaml">
alias: [/impression/collectable]
meta:
  layout: bare
</route>

<template>
  <div v-if="ready">
    <print-header />
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
              :src="`/images/flags/${publicationCode.split('/')[0]}.png`"
            >
            <br>
            {{ publicationCode.split("/")[1] }}
            <br>
          </td>
          <td v-for="subrange in numbersPerRow" :key="subrange">
            <span
              v-for="letter in issuesPerCell[publicationCode][
                (line - 1) * numbersPerRow + subrange
              ]"
              :key="letter"
              class="letter"
            >{{ letter }}</span>
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
                  {{ numberToLetter(group) }}<br>{{ group * 100 + 1 }}-&gt;{{
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
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { coa } from '~/stores/coa'
import { collection as collectionStore } from '~/stores/collection'

const doubleNumberRegex = /^(\d{1,2})(\d{2})-(\d{2})$/
const lines = 2
const numbersPerRow = 100 / lines
const countryNames = $computed(() => coa().countryNames)
const publicationNames = $computed(() => coa().publicationNames)
const collection = $computed(() => collectionStore().collection)
const totalPerPublication = $computed(() => collectionStore().totalPerPublication)
const ready = $computed(
  () => issuesPerCell && countryNames && Object.keys(publicationNames).length,
)
const maxLetter = $computed(() =>
  !issuesPerCell
    ? null
    : numberToLetter(
      [
        ...new Set(
          JSON.stringify(issuesPerCell)
            .match(/"[a-zA-Z]+"/g)
            .map(letter => letter.replace(/"/g, '')),
        ),
      ]
        .map(letterToNumber)
        .sort((a, b) => b - a)[0],
    ),
)
const { t: $t } = useI18n()
const issueCountTitle = $computed(() => {
  const issueCountString = $t('numéro | numéros', 2)
  return (
    issueCountString[0].toUpperCase()
      + issueCountString.substring(1, issueCountString.length).toLowerCase()
  )
})
const fetchCountryNames = coa().fetchCountryNames
const fetchPublicationNames = coa().fetchPublicationNames
const loadCollection = collectionStore().loadCollection
const loadPurchases = collectionStore().loadPurchases
const numberToLetter = number =>
  String.fromCharCode(
    (number < 26 ? 'a'.charCodeAt() : 'A'.charCodeAt() - 26) + number,
  )
const letterToNumber = letter =>
  letter >= 'a'
    ? letter.charCodeAt() - 'a'.charCodeAt()
    : 26 + letter.charCodeAt() - 'A'.charCodeAt()
const groupsInRange = (range) => {
  const groups = []
  for (let group = 6 * range; group < 6 * (range + 1); group++)
    groups.push(group)

  return groups
}

let issuesPerCell = $ref(null)

watch(
  () => collection,
  (newCollectionValue) => {
    const addIssueToCell = (
      acc,
      publicationCode,
      issueNumber,
      isDoubleIssueStart,
      isDoubleIssueEnd,
    ) => {
      let mod, number
      if (Number.isNaN(issueNumber % 100)) {
        mod = 'non-numeric'
        number = issueNumber
      }
      else {
        mod = issueNumber % 100
        number = (issueNumber - mod) / 100
      }
      if (!acc[publicationCode]) {
        acc[publicationCode] = {
          'non-numeric': [],
        }
      }
      if (!acc[publicationCode][mod])
        acc[publicationCode][mod] = []

      acc[publicationCode][mod].push(
        [
          isDoubleIssueEnd ? '<' : '',
          typeof number === 'string' ? number : numberToLetter(number),
          isDoubleIssueStart ? '>' : '',
        ].join(''),
      )
    }
    issuesPerCell = newCollectionValue.reduce((acc, issue) => {
      const publicationCode = `${issue.country}/${issue.magazine}`
      const issueNumber = issue.issueNumber
      const doubleNumberMatch = issueNumber.match(doubleNumberRegex)
      if (
        doubleNumberMatch
        && parseInt(doubleNumberMatch[2]) === parseInt(doubleNumberMatch[1]) + 1
      ) {
        const [, part1, issue1, issue2] = doubleNumberMatch
        addIssueToCell(acc, publicationCode, `${part1}${issue1}`, true)
        addIssueToCell(acc, publicationCode, `${part1}${issue2}`, false, true)
      }
      else {
        addIssueToCell(acc, publicationCode, issueNumber)
      }
      return acc
    }, {})
  },
)
watch(
  () => totalPerPublication,
  (newValue) => {
    fetchPublicationNames(Object.keys(newValue))
  },
)

onMounted(async () => {
  await loadCollection()
  await fetchCountryNames()
  await loadPurchases()
})
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
