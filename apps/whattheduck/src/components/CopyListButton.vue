<template>
  <fab-header-button
    v-model:fab="fab"
    :icon="{ ios: copyOutline, md: copySharp }"
    :options="[...copyListModes]"
    @update:value="
      copyToClipboard($event.textPrefix!, $event.getTextToCopy!());
      (fab?.$el as HTMLIonFabElement).close();
    "
  />
</template>
<script setup lang="ts">
import { Clipboard as CapacitorClipboard } from '@capacitor/clipboard';
import { toastController } from '@ionic/vue';
import { copyOutline, copySharp } from 'ionicons/icons';

import { app } from '~/stores/app';

const { countryNames, publicationNames } = storeToRefs(coa());
const { publicationcode } = storeToRefs(app());
const { copyListModes } = app();

const fab = shallowRef<ComponentPublicInstance<HTMLIonFabElement> | null>(null);

const copyToClipboard = async (textPrefix: string, text: Promise<string>) => {
  await CapacitorClipboard.write({
    string: `${textPrefix} ${clipboardTextPrefix.value} ${await text}`,
  });

  const toast = await toastController.create({
    message: 'La liste de numéros a été copiée dans le presse-papiers',
    translucent: true,
    duration: 2000,
  });
  await toast.present();
};

const clipboardTextPrefix = computed(() => {
  const publicationName = publicationNames.value[publicationcode.value!] || publicationcode.value;
  const countryName = countryNames.value![publicationcode.value!.split('/')[0]];
  return `${publicationName} (${countryName}):`;
});
</script>
