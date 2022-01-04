<template>
  <b-container fluid class="p-4 bg-dark">
    <b-row>
      <b-col cols="12">
        <b-select v-model="selectedDataset">
          <b-select-option value="published-fr-recent">
            published-fr-recent
          </b-select-option>
        </b-select>
        <div v-if="maintainedEntryurlsCount !== null">
          {{ maintainedEntryurlsCount }} images can currently be seen on
          Duckguessr.
        </div>
        Cliquez sur les images qui ne doivent pas être utilisées dans
        Duckguessr:
        <ul>
          <li>Images qui ne contiennent pas de dessin</li>
          <li>Images sur lesquelles le nom du dessinateur est inscrit</li>
        </ul>
      </b-col>
    </b-row>
    <b-row>
      <b-col
        v-for="data in entryurlsPendingMaintenanceWithUrls"
        :key="data.sitecodeUrl"
        :class="{
          'd-flex': true,
          'align-items-center': true,
          invalid: invalidSitecodeUrls.includes(data.sitecodeUrl),
        }"
        col
        cols="1"
        @click="toggleEntryurl(data.sitecodeUrl)"
      >
        <b-img thumbnail fluid :src="data.url" />
      </b-col>
    </b-row>
    <b-btn variant="success" @click="submitInvalidations()">OK</b-btn>
  </b-container>
</template>

<script lang="ts">
import { onMounted, ref, watch } from '@nuxtjs/composition-api'
import { io, Socket } from 'socket.io-client'

export default {
  name: 'Clean',
  setup() {
    let entryurlsPendingMaintenance: Array<any>
    const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
    const maintainedEntryurlsCount = ref(null as Number | null)
    const selectedDataset = ref('published-fr-recent' as String)
    const invalidSitecodeUrls = ref([] as Array<string>)
    let gameSocket: Socket | null = null

    onMounted(() => {
      gameSocket = io(`${process.env.SOCKET_URL}/admin/maintenance`)
      gameSocket!.emit('get')
      gameSocket!.on('entryurlsPendingMaintenance', (data: any) => {
        entryurlsPendingMaintenance = data.entryurlsToMaintain
        maintainedEntryurlsCount.value = data.maintainedEntryurlsCount
        entryurlsPendingMaintenanceWithUrls.value =
          entryurlsPendingMaintenance.map((data: any) => ({
            ...data,
            url: `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${data.sitecodeUrl}`,
          }))
      })
    })

    watch(
      () => selectedDataset.value,
      (newValue) => {
        gameSocket = io(
          `${process.env.SOCKET_URL}/admin/maintenance?${newValue}`
        )
      },
      {
        immediate: true,
      }
    )

    return {
      selectedDataset,
      entryurlsPendingMaintenanceWithUrls,
      invalidSitecodeUrls,
      maintainedEntryurlsCount,
      toggleEntryurl(sitecodeUrl: string) {
        if (invalidSitecodeUrls.value.includes(sitecodeUrl)) {
          invalidSitecodeUrls.value.splice(
            invalidSitecodeUrls.value.indexOf(sitecodeUrl),
            1
          )
        } else {
          invalidSitecodeUrls.value.push(sitecodeUrl)
        }
      },
      submitInvalidations() {
        gameSocket!.emit('postValidationsChoices', {
          entryurlsPendingMaintenance,
          invalidSitecodeUrls: invalidSitecodeUrls.value,
        })
        window.location.reload()
      },
    }
  },
  head() {
    return {
      title: 'Duckguessr - image maintenance',
    }
  },
}
</script>

<style scoped lang="scss">
.col {
  border: 1px solid green;
  cursor: pointer;

  &.invalid {
    border: 1px solid red;
  }

  img {
    height: initial;
  }
}
</style>
