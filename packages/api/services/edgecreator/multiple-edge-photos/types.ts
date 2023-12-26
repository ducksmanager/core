import { elementImage } from "~prisma-clients/client_edgecreator";

export default interface EdgeSprites {
  sendNewEdgePhotoEmail: (publicationcode: string,
    issuenumber: string, callback: (data: { url: string }) => void) => void;
  createElementImage: (hash: string,
    fileName: string, callback: (data: { photoId: number }) => void) => void;
  checkTodayLimit: (callback: (data: {
    uploadedFilesToday: string[];
  }) => void) => void;
  getImageByHash: (hash: string, callback: (data: elementImage | null) => void) => void;
}
