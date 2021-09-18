<template>
  <b-container fluid class="p-4 bg-dark">
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
import { onMounted, ref } from '@nuxtjs/composition-api'
import { io, Socket } from 'socket.io-client'

export default {
  name: 'Clean',
  setup() {
    let entryurlsPendingMaintenance: Array<any>
    const entryurlsPendingMaintenanceWithUrls = ref([] as Array<any>)
    const invalidSitecodeUrls = ref([] as Array<string>)
    let gameSocket: Socket | null = null

    onMounted(() => {
      gameSocket = io(`${process.env.SOCKET_URL}/admin/maintenance`)
      gameSocket!.emit('get')
      gameSocket!.on('entryurlsPendingMaintenance', (data: any) => {
        entryurlsPendingMaintenance = data
        entryurlsPendingMaintenanceWithUrls.value =
          entryurlsPendingMaintenance.map((data: any) => ({
            ...data,
            url: `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${data.sitecodeUrl}`,
          }))
      })
    })

    return {
      entryurlsPendingMaintenanceWithUrls,
      invalidSitecodeUrls,
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
