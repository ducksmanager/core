import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { toastController } from '@ionic/vue';
import type { Router } from 'vue-router';

export default (router: Router, coverIdServices: ReturnType<typeof useDmSocket>['coverId']['services']) => {
  const { t } = useI18n();
  const searchCoverFromBase64String = async (base64: string, origin: 'pickCoverFile' | 'takePhoto') =>
    coverIdServices.searchFromCover({ base64 }).then(async (results) => {
      if (results.covers?.length) {
        router.push({
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
    });
  return {
    pickCoverFile: async () => {
      const coverFile = await FilePicker.pickImages({ readData: true });
      if (coverFile.files.length) {
        const reader = new FileReader();
        reader.onload = function (event) {
          searchCoverFromBase64String(event.target!.result?.toString()!, 'pickCoverFile');
        };
        reader.readAsDataURL(coverFile.files[0].blob!);
      }
    },

    takePhoto: async () =>
      Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 100,
      }).then((photo) => {
        searchCoverFromBase64String(photo.base64String!, 'takePhoto');
      }),
  };
};
