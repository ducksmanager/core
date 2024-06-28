<template>
  <ion-fab ref="fab" v-if="copyListModes" vertical="top" horizontal="end" id="copy-modes" slot="fixed">
    <ion-fab-button><ion-icon :ios="copyOutline" :android="copySharp"></ion-icon></ion-fab-button>
    <ion-fab-list side="bottom">
      <ion-item
        :detail="false"
        button
        class="ion-align-items-center ion-text-nowrap"
        :disabled="isOfflineMode && !listMode.showIfOffline"
        v-for="listMode of copyListModes"
        @click="
          copyToClipboard(listMode.textPrefix, listMode.getTextToCopy());
          (fab?.$el as HTMLIonFabElement).close();
        "
      >
        <ion-label>{{ listMode.label }}</ion-label></ion-item
      ></ion-fab-list
    ></ion-fab
  >
</template>
<script setup lang="ts">
import { copyOutline, copySharp } from 'ionicons/icons';
import { Clipboard } from '@capacitor/clipboard';
import { app } from '~/stores/app';
import { toastController } from '@ionic/vue';

const { countryNames, publicationNames } = storeToRefs(coa());
const { isOfflineMode, publicationcode } = storeToRefs(app());
const { copyListModes } = app();

// eslint-disable-next-line no-undef
const fab = ref<ComponentPublicInstance<HTMLIonFabElement> | null>(null);

const copyToClipboard = async (textPrefix: string, text: Promise<string>) => {
  await Clipboard.write({
    string: `${textPrefix} ${clipboardTextPrefix.value} ${await text}`,
  });

  const toast = await toastController.create({
    message: 'La liste de numéros a été copiée dans le presse-papiers',
    translucent: true,
    duration: 2000,
  });
  toast.present();
};

const clipboardTextPrefix = computed(() => {
  const publicationName = publicationNames.value[publicationcode.value!] || publicationcode.value;
  const countryName = countryNames.value![publicationcode.value!.split('/')[0]];
  return `${publicationName} (${countryName}):`;
});
</script>
<style scoped lang="scss">
ion-fab {
  ion-fab-list {
    margin-top: 3rem;
    right: -2.5rem;
    ion-item {
      padding-right: 2.5rem;

      &.selected {
        ::part(native) {
          border: 1px solid darkgray;
        }
      }
    }
  }

  ion-fab-button {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.75rem;
  }

  > ion-fab-button {
    margin-right: 1rem;
    width: 1.8rem;
    height: 1.8rem;
  }
}

#copy-modes[hidden] {
  display: block;
}

ion-icon {
  width: 18px;
  height: 18px;
}
</style>
