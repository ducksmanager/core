export interface ScopedError<ErrorKey extends string = string> {
  error: ErrorKey;
  message: string;
  selector: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Last<T extends unknown[]> = T extends [...infer _I, infer L] ? L : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LastParameter<F extends (...args: any) => unknown> = Last<
  Parameters<F>
>;

export type EventReturnTypeIncludingError<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => unknown,
> =
  LastParameter<LastParameter<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventReturnType<T extends (...args: any[]) => unknown> =
  EventReturnTypeIncludingError<T> & { error?: never };

export type EitherOr<A, B> = A | B extends object
  ?
  | (A & Partial<Record<Exclude<keyof B, keyof A>, never>>)
  | (B & Partial<Record<Exclude<keyof A, keyof B>, never>>)
  : A | B;

export type Errorable<T, ErrorKey extends string> = EitherOr<
  T,
  EitherOr<{ error: ErrorKey; errorDetails?: string }, ScopedError<ErrorKey>>
>;
