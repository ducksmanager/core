import { CameraPreview } from '@capacitor-community/camera-preview';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { toastController } from '@ionic/vue';
import type { Router } from 'vue-router';

export default (
  router: Router,
  coverIdEvents: ReturnType<typeof useDmSocket>['coverId'],
): {
  pickCoverFile: () => Promise<void>;
  takePhoto: () => Promise<void>;
} => {
  const { t } = useI18n();
  const searchCoverFromBase64String = async (base64: string, origin: 'pickCoverFile' | 'takePhoto') =>
    coverIdEvents.searchFromCover({ base64 }).then(async (results) => {
      CameraPreview.stop();
      if (results.covers?.length) {
        await router.push({
          path: '/cover-search-results',
          query: { searchResults: JSON.stringify(results), origin },
        });
      } else {
        const toast = await toastController.create({
          message: t('Aucun résultat pour votre photo, veuillez réessayer.'),
          duration: 2000,
          cssClass: 'toast-error',
          position: 'middle',
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
          reader.onload = function (event) {
            return searchCoverFromBase64String(event.target!.result!.toString()!, 'pickCoverFile');
          };
          reader.readAsDataURL(coverFile.files[0].blob!);
        }
      }
    },

    takePhoto: () =>
      new Promise((resolve) => {
        CameraPreview.captureSample({ quality: 50 }).then(({ value: photoBase64 }) => {
          resolve();
          searchCoverFromBase64String(photoBase64, 'takePhoto');
        });
      }),
  };
};
