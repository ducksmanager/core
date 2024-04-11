import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from 'vue-router';

export default (router: Router, coverIdServices: ReturnType<typeof useDmSocket>['coverId']['services']) => {
  const searchCoverFromBase64String = async (base64: string, origin: 'pickCoverFile' | 'takePhoto') =>
    coverIdServices.searchFromCover({ base64 }).then((results) => {
      router.push({
        path: '/cover-search-results',
        query: { searchResults: JSON.stringify(results), origin },
      });
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
