import { CameraPreview } from '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { toastController } from '@ionic/vue';
import type { Router } from 'vue-router';
import { app } from '~/stores/app';

export default (
  router: Router,
  coverIdEvents: ReturnType<typeof useDmSocket>['coverId'],
  storySearchEvents: ReturnType<typeof useDmSocket>['storySearch'],
): {
  pickCoverFile: () => Promise<void>;
  takePhoto: () => Promise<void>;
} => {
  const { t } = useI18n();

  const normalizeBase64 = (input: string): string =>
    input.startsWith('data:') ? input : `data:image/jpeg;base64,${input}`;

  const searchFromCover = async (base64: string) =>
    app().isFastCoverSearchEnabled
      ? storySearchEvents
          .findSimilarImages(base64, true)
          .then((results) => ('results' in results ? results.results : null))
      : coverIdEvents.searchFromCover(base64).then((results) => ('covers' in results ? results.covers : null));

  let results: Awaited<ReturnType<typeof searchFromCover>> = null;
  const searchCoverFromBase64String = async (base64: string, origin: 'pickCoverFile' | 'takePhoto') =>
    searchFromCover(normalizeBase64(base64))
      .then((newResults) => {
        results = newResults;
      })
      .finally(async () => {
        if (results?.length) {
          if (Capacitor.isNativePlatform()) {
            if ((await CameraPreview.isCameraStarted()).value) {
              await CameraPreview.stop();
            }
          }
          app().isCameraPreviewShown = false;
          await router.push({
            path: '/cover-search-results',
            query: { searchResults: JSON.stringify(results), origin },
          });
        } else {
          const toast = await toastController.create({
            message: t('Aucun résultat pour votre photo, veuillez réessayer.'),
            duration: 2000,
            cssClass: 'toast-error',
            positionAnchor: 'overlay',
            position: 'bottom',
            translucent: true,
          });

          await toast.present();
        }
        return Promise.resolve();
      });
  return {
    pickCoverFile: async () => {
      const coverFile = await FilePicker.pickImages({ readData: true });
      if (coverFile.files.length) {
        if (coverFile.files[0].data) {
          return searchCoverFromBase64String(coverFile.files[0].data, 'pickCoverFile');
        } else {
          const reader = new FileReader();
          reader.onload = (event) => searchCoverFromBase64String(event.target!.result!.toString()!, 'pickCoverFile');
          reader.readAsDataURL(coverFile.files[0].blob!);
        }
      }
    },

    takePhoto: () =>
      new Promise((resolve) => {
        CameraPreview.captureSample({ quality: 50 }).then(({ value: photoBase64 }) => {
          resolve();
          return searchCoverFromBase64String(photoBase64, 'takePhoto');
        });
      }),
  };
};
