import TextServices from "~edgecreator-services/text/types";
import { useSocket } from "~socket.io-client-services";

const defaultExport = (options: {
  session: {
    getToken: () => Promise<string | null | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const { addNamespace } = inject("socket") as ReturnType<typeof useSocket>;

  return {
    options,
    text: addNamespace<TextServices>(TextServices.namespaceEndpoint),
  };
};

export default defaultExport;

export const edgecreatorSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
