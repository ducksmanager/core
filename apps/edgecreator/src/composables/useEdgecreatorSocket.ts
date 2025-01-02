import { inject, type InjectionKey } from "vue";

import {
  ClientEvents as BrowseServices,
  endpoint as browseEndpoint,
} from "~edgecreator-services/browse";
import {
  ClientEvents as ImageInfoServices,
  endpoint as imageInfoEndpoint,
} from "~edgecreator-services/image-info";
import {
  ClientEvents as SaveServices,
  endpoint as saveEndpoint,
} from "~edgecreator-services/save";
import {
  ClientEvents as TextServices,
  endpoint as textEndpoint,
} from "~edgecreator-services/text";
import {
  ClientEvents as UploadServices,
  endpoint as uploadEndpoint,
} from "~edgecreator-services/upload";
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
    imageInfo: socket.addNamespace<ImageInfoServices>(imageInfoEndpoint, {
      session,
    }),
    browse: socket.addNamespace<BrowseServices>(browseEndpoint, {
      session,
    }),
    save: socket.addNamespace<SaveServices>(saveEndpoint, {
      session,
    }),
    text: socket.addNamespace<TextServices>(textEndpoint, {
      session,
    }),
    upload: socket.addNamespace<UploadServices>(uploadEndpoint, {
      session,
    }),
  };
};

export default defaultExport;

export const edgecreatorSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
