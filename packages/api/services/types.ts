import { EventsMap } from "@socket.io/component-emitter";
import { Namespace, Socket } from "socket.io";

import { User } from "~dm-types/SessionUser";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Last<T extends unknown[]> = T extends [...infer I, infer L] ? L : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LastParameter<F extends (...args: any) => unknown> = Last<Parameters<F>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventReturnType<T extends (...args: any[]) => unknown> =
  // @ts-expect-error ???
  LastParameter<LastParameter<T>>;

export abstract class NamespaceGeneric<Services extends EventsMap> extends Namespace<
  Services,
  Record<string, never>,
  Record<string, never>,
  { user?: User }
> {
  public static endpoint: string;
}

export type SocketGeneric<Services extends EventsMap> = Socket<Services,
  Record<string, never>,
  Record<string, never>,
  { user?: User }
>;

type EitherOr<A, B> = (A | B) extends object ? (A & Partial<Record<Exclude<keyof B, keyof A>, never>>) | (B & Partial<Record<Exclude<keyof A, keyof B>, never>>) : A | B;

export type Errorable<T, ErrorKey extends string> = EitherOr<T, { error: ErrorKey, errorDetails?: string }>;
