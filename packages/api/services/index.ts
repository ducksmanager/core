// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Last<T extends unknown[]> = T extends [...infer I, infer L] ? L : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LastParameter<F extends (...args: any) => unknown> = Last<Parameters<F>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventReturnType<T extends (...args: any[]) => unknown> =
  // @ts-expect-error ???
  LastParameter<LastParameter<T>>;
