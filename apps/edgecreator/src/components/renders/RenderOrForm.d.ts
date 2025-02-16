export type RenderOrForm<T extends Record<string, unknown>> =
| (T & {form?: never})
| {
    form: {
      [K in keyof T]: T[K][];
    } & {
        stepNumber: number};
  };