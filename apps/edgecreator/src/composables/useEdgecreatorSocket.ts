import type { SocketClient } from "socket-call-client";
import { inject, type InjectionKey } from "vue";

import type { ClientEvents as BrowseServices } from "~edgecreator-services/browse";
import type { ClientEvents as ImageInfoServices } from "~edgecreator-services/image-info";
import namespaces from "~edgecreator-services/namespaces";
import type { ClientEvents as SaveServices } from "~edgecreator-services/save";
import type { ClientEvents as TextServices } from "~edgecreator-services/text";
import type { ClientEvents as UploadServices } from "~edgecreator-services/upload";

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
    imageInfo: socket.addNamespace<ImageInfoServices>(namespaces.IMAGE_INFO, {
      session,
    }),
    browse: socket.addNamespace<BrowseServices>(namespaces.BROWSE, {
      session,
    }),
    save: socket.addNamespace<SaveServices>(namespaces.SAVE, {
      session,
    }),
    text: socket.addNamespace<TextServices>(namespaces.TEXT, {
      session,
    }),
    upload: socket.addNamespace<UploadServices>(namespaces.UPLOAD, {
      session,
    }),
  };
};

export default defaultExport;

export const edgecreatorSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
