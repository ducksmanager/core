export type AllNonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
