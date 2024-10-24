import type { Errorable } from "~socket.io-services";

export const namespaceEndpoint = "/image-info";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getImageInfo: (
    targetUrl: string,
    callback: (
      value: Errorable<
        {
          results: {
            dimensions: { width: number; height: number };
            base64: string;
            url: string;
          };
        },
        "Cloudinary error"
      >,
    ) => void,
  ) => void;
}
