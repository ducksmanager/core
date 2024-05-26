import BrowseServices from "~edgecreator-services/browse/types";
import ImageInfoServices from "~edgecreator-services/image-info/types";
import SaveServices from "~edgecreator-services/save/types";
import TextServices from "~edgecreator-services/text/types";
import UploadServices from "~edgecreator-services/upload/types";
import type { useSocket } from "~socket.io-client-services";

const defaultExport = (
  socket: ReturnType<typeof useSocket>,
  options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onConnectError: (e: any, namespace: string) => Promise<void> | void;
    session: {
      getToken: () => Promise<string | null | undefined>;
      clearSession: () => void;
      sessionExists: () => Promise<boolean>;
    };
  },
) => {
  const { addNamespace } = socket;

  const { session, onConnectError } = options;

  return {
    options,
    imageInfo: addNamespace<ImageInfoServices>(
      ImageInfoServices.namespaceEndpoint,
      { session, onConnectError },
    ),
    browse: addNamespace<BrowseServices>(BrowseServices.namespaceEndpoint, {
      session,
      onConnectError,
    }),
    save: addNamespace<SaveServices>(SaveServices.namespaceEndpoint, {
      session,
      onConnectError,
    }),
    text: addNamespace<TextServices>(TextServices.namespaceEndpoint, {
      session,
      onConnectError,
    }),
    upload: addNamespace<UploadServices>(UploadServices.namespaceEndpoint, {
      session,
      onConnectError,
    }),
  };
};

export default defaultExport;

export const edgecreatorSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
