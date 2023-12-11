export const exclude = <Type, Key extends keyof Type>(
  object: Type | null,
  key: Key,
): Omit<Type, Key> | null => {
  if (!object) {
    return object;
  }
  delete object[key];
  return object;
};
