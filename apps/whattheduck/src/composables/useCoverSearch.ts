import { CameraPreview } from '@capacitor-community/camera-preview';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { toastController } from '@ionic/vue';
import type { Router } from 'vue-router';
import { EventOutput } from 'socket-call-client';
import type { ClientEvents as CoverIdServices } from '~dm-services/cover-id';
import { app } from '~/stores/app';

export default (
  router: Router,
  coverIdEvents: ReturnType<typeof useDmSocket>['coverId'],
): {
  pickCoverFile: () => Promise<void>;
  takePhoto: () => Promise<void>;
} => {
  const { t } = useI18n();
  const searchCoverFromBase64String = async (base64: string, origin: 'pickCoverFile' | 'takePhoto') => {
    let results: EventOutput<CoverIdServices, 'searchFromCover'> | null = null;
    return coverIdEvents
      .searchFromCover(base64)
      .then(async (newResults) => {
        results = newResults;
      })
      .finally(async () => {
        if (results?.covers?.length) {
          if ((await CameraPreview.isCameraStarted()).value) {
            await CameraPreview.stop();
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
  };
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
