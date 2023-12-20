import { EventsMap } from "@socket.io/component-emitter";
import { Namespace, Socket  } from "socket.io";

import { User } from "../../types/SessionUser";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Last<T extends unknown[]> = T extends [...infer I, infer L] ? L : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LastParameter<F extends (...args: any) => unknown> = Last<Parameters<F>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventReturnType<T extends (...args: any[]) => unknown> =
  // @ts-expect-error ???
  LastParameter<LastParameter<T>>;


export interface NamespaceGeneric<Services extends EventsMap> extends Namespace<
  Services,
  Record<string, never>,
  Record<string, never>,
  { user?: User }
> {}
  
export type SocketGeneric<Services extends EventsMap> = Socket<Services,
  Record<string, never>,
  Record<string, never>,
  { user?: User }
>;
  