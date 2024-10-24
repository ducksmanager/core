import type { Errorable } from "~socket.io-services";

export const namespaceEndpoint = "/text";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getText: (
    parameters: {
      color: string;
      colorBackground: string;
      width: number;
      font: string;
      text: string;
    },
    callback: (
      value: Errorable<
        {
          results: {
            width: number;
            height: number;
            url: string;
          };
        },
        "Image generation error"
      >,
    ) => void,
  ) => void;
}
