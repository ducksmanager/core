export type Render<T extends Record<string, unknown>> = T;

export type Form<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K][];
} & {
  stepNumber: number;
};

export type RenderOrForm<T extends Record<string, unknown>> =
  | Render<T>
  | Form<T>;

