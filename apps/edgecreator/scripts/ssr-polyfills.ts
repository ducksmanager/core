if (
  typeof (globalThis as typeof globalThis & { self?: typeof globalThis })
    .self === "undefined"
) {
  (globalThis as typeof globalThis & { self: typeof globalThis }).self =
    globalThis as Window & typeof globalThis;
}
