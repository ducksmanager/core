<template>
  <ion-page v-show="token === null">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title class="ion-padding-start">{{ $t('What The Duck') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content> {{ $t('What The Duck') }} </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { app } from '~/stores/app';

const { token, socket } = storeToRefs(app());

watch(socket, () => {
  if (socket.value) {
    socket.value.collection.getIssues();
  }
});
</script>
