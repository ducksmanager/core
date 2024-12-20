export type ScopedError<ErrorKey extends string = string> = {
  error: ErrorKey;
  message: string;
  selector: string;
}

type Last<T extends unknown[]> = T extends [...infer _I, infer L] ? L : never;

type LastParameter<F extends (...args: unknown[]) => unknown> = Last<
  Parameters<F>
>;

export type EventReturnTypeIncludingError<
  T extends (...args: any[]) => unknown,
> = LastParameter<LastParameter<T>>;

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
