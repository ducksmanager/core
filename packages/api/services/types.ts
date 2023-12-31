import { ScopedError } from "~dm-types/ScopedError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Last<T extends unknown[]> = T extends [...infer I, infer L] ? L : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LastParameter<F extends (...args: any) => unknown> = Last<Parameters<F>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventReturnType<T extends (...args: any[]) => unknown> =
  // @ts-expect-error ???
  LastParameter<LastParameter<T>> & { error?: never };

type EitherOr<A, B> = A | B extends object
  ?
      | (A & Partial<Record<Exclude<keyof B, keyof A>, never>>)
      | (B & Partial<Record<Exclude<keyof A, keyof B>, never>>)
  : A | B;

export type Errorable<T, ErrorKey extends string> = EitherOr<
  T,
  EitherOr<{ error: ErrorKey; errorDetails?: string }, ScopedError<ErrorKey>>
>;
