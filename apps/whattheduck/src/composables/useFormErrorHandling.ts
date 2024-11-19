const getModel = (label: string) =>
  extendRef(ref(''), {
    label,
    isValid: false,
    isInvalid: false,
    isTouched: false,
    errorText: '',
  });

import { extendRef } from '@vueuse/core';
const createFieldsWithModel = <T extends string>(fields: Record<T, string>): Record<T, ReturnType<typeof getModel>> =>
  Object.fromEntries(Object.entries(fields).map(([name, label]) => [name, getModel(label as T)])) as Record<
    T,
    ReturnType<typeof getModel>
  >;

export default <T extends string>(fields: Record<T, string>): Record<T, ReturnType<typeof getModel>> =>
  createFieldsWithModel(fields);
