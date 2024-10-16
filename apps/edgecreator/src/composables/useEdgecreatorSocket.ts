import { inject, type InjectionKey } from "vue";

import BrowseServices from "~edgecreator-services/browse/types";
import ImageInfoServices from "~edgecreator-services/image-info/types";
import SaveServices from "~edgecreator-services/save/types";
import TextServices from "~edgecreator-services/text/types";
import UploadServices from "~edgecreator-services/upload/types";
import type { SocketClient } from "~socket.io-client-services";

const defaultExport = (options: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | null | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const socket = inject("edgecreatorSocket") as SocketClient;
  socket.onConnectError = options.onConnectError;
  const { session } = options;

  return {
    options,
    imageInfo: socket.addNamespace<ImageInfoServices>(
      ImageInfoServices.namespaceEndpoint,
      { session },
    ),
    browse: socket.addNamespace<BrowseServices>(
      BrowseServices.namespaceEndpoint,
      {
        session,
      },
    ),
    save: socket.addNamespace<SaveServices>(SaveServices.namespaceEndpoint, {
      session,
    }),
    text: socket.addNamespace<TextServices>(TextServices.namespaceEndpoint, {
      session,
    }),
    upload: socket.addNamespace<UploadServices>(
      UploadServices.namespaceEndpoint,
      {
        session,
      },
    ),
  };
};

export default defaultExport;

export const edgecreatorSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
