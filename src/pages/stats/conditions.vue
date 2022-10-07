<template>
  <LinkToCollectionIfNoIssue />
  <PieChart :chart-data="chartData" :options="options" />
</template>

<script setup>
import {
  ArcElement,
  Chart,
  Legend,
  PieController,
  Title,
  Tooltip,
} from 'chart.js'
import { PieChart } from 'vue-chart-3'

import { collection as collectionStore } from '~/stores/collection'
import { collection } from '~/composables/collection'
import { condition } from '~/composables/condition'
Chart.register(Legend, PieController, Tooltip, Title, ArcElement)

let conditions

conditions = condition().conditions
collection()
const numberPerCondition = $computed(() =>
  collectionStore().collection.reduce(
    (acc, { condition }) => ({
      ...acc,
      [condition || 'indefini']: (acc[condition || 'indefini'] || 0) + 1,
    }),
    {},
  ),
)
const conditionsWithoutMissing = conditions.filter(
  ({ value }) => value !== 'missing',
)
const values = $computed(() =>
  Object.values(conditionsWithoutMissing).map(
    ({ dbValue }) => numberPerCondition[dbValue],
  ),
)
const colors = Object.values(conditionsWithoutMissing.map(({ color }) => color))
const chartData = $computed(() => ({
  labels: Object.values(conditionsWithoutMissing).map(({ text }) => text),
  datasets: [
    {
      data: values,
      backgroundColor: colors,
    },
  ],
}))
const options = $computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (tooltipItem) => {
          const { dataset, parsed: currentValue } = tooltipItem
          const total = dataset.data.reduce((acc, value) => acc + value, 0)
          const percentage = parseFloat(
            ((currentValue / total) * 100).toFixed(1),
          )
          return `${currentValue} (${percentage}%)`
        },
        title: ([tooltipItem]) => chartData.labels[tooltipItem.dataIndex],
      },
    },
  },
}))
</script>

<style scoped>

</style>
