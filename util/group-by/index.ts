type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & string];

type NestedValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? NestedValue<T[K], R>
      : never
    : never;

type GroupByValueType<
  T,
  V extends null | "[]" | NestedKeyOf<T> | `${NestedKeyOf<T>}[]` = null,
> = V extends null
  ? T
  : V extends "[]"
    ? T[]
    : V extends `${infer U}[]`
      ? U extends NestedKeyOf<T>
        ? NestedValue<T, U>[]
        : never
      : V extends NestedKeyOf<T>
        ? NestedValue<T, V>
        : never;

type GroupByResultType<
  T,
  V extends null | "[]" | NestedKeyOf<T> | `${NestedKeyOf<T>}[]`,
  R,
> = [R] extends [never]
  ? GroupByValueType<T, V>
  : V extends null
    ? R
    : V extends "[]"
      ? R[]
      : V extends `${infer U}[]`
        ? U extends NestedKeyOf<T>
          ? R[]
          : never
        : V extends NestedKeyOf<T>
          ? R
          : never;

// Extract common types to avoid duplication
type GroupByKeyType<
  T,
  K extends null | (keyof T & (string | number)) | ((item: T) => string),
> = K extends null
  ? T & string
  : K extends (item: T) => string
    ? string
    : T[K & (keyof T & (string | number))] & (string | number);

type GroupByMapperFn<T, V extends null | "[]" | NestedKeyOf<T> | `${NestedKeyOf<T>}[]`, R> = (
  value: GroupByValueType<T, V> extends (infer U)[]
    ? U
    : V extends keyof T
      ? T[V]
      : T,
  index: number,
) => R;

type GroupByReturnType<
  T,
  K extends null | (keyof T & (string | number)) | ((item: T) => string),
  V extends null | "[]" | NestedKeyOf<T> | `${NestedKeyOf<T>}[]`,
  R,
> = Record<GroupByKeyType<T, K>, GroupByResultType<T, V, R>>;

declare global {
  interface Array<T> {
    /**
     * Groups the elements of an array by a specified field name.
     *
     * @param fieldNameOrCallback - The field name to group by. If equal to null and the array to group by is an array of strings, the keys of the output array will be the values of the input array. Implies that the valueFieldName must be set to '[]' or null. If equal to a function, the function will be called for each element of the array and the result will be used as the key.
     * @param valueFieldName - Optional. The field name to use as the value in the grouped result.
     *                         If set to 'myField.myOtherField', the value of each object at myField.myOtherField will be used as the value. Only one level of nesting is supported.
     *                         If set to '[]', an array of objects will be used as the value.
     *                         If set to 'myField[]', an array of values of myField will be used as the value.
     *                         If set to 'myField.myOtherField[]', an array of values of myField.myOtherField will be used as the value. Only one level of nesting is supported.
     *                         If not provided or null, the entire object will be used as the value.
     * @param mapperFn - Optional. If set, each value (calculated from the valueFieldName parameter) and its index will be mapped using this function.
     * @returns An object with the grouped elements.
     * @example
     * // returns { John: { id: 3, name: 'John' }, Jane: { id: 2, name: 'Jane' } }
     * [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'John' }]
     *      .groupBy('name');
     *
     * @example
     * // returns { John: [{ id: 1, name: 'John' }, { id: 3, name: 'John' }], Jane: [{ id: 2, name: 'Jane' }] }
     * [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'John' }]
     *      .groupBy('name', '[]');
     *
     * @example
     * // returns { John: 3, Jane: 2 }
     * [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'John' }]
     *      .groupBy('name', 'id');
     *
     * @example
     * // returns { John: [1, 3], Jane: [2] }
     * [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'John' }]
     *      .groupBy('name', 'id[]');
     *
     * @example
     * // returns { John: [3, 9], Jane: [6] }
     * [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'John' }]
     *      .groupBy('name', 'id[]', (id) => id * 3);
     *
     * @example
     * // returns { John: 1, Jane: 2 }
     * [{ id: {"internal": 1}, name: 'John' }, { id: {"internal": 2}, name: 'Jane' }, { id: {"internal": 3}, name: 'John' }]
     *      .groupBy('name', 'id.internal');
     *
     * @example
     * // returns { John: [1, 3], Jane: [2] }
     * [{ id: {"internal": 1}, name: 'John' }, { id: {"internal": 2}, name: 'Jane' }, { id: {"internal": 3}, name: 'John' }]
     *      .groupBy('name', 'id.internal[]');
     *
     * @example
     * // returns { John: {name: 'John', id: 1}, Jane: {name: 'Jane', id: 2} }
     * ['John', 'Jane']
     *      .groupBy(null, null, (name, index) => ({ name, id: index+1 }));
     */
    groupBy<
      K extends null | (keyof T & (string | number)) | ((item: T) => string),
      V extends null | "[]" | NestedKeyOf<T> | `${NestedKeyOf<T>}[]` = null,
      R = never,
    >(
      fieldName: K,
      valueFieldName?: V,
      mapperFn?: GroupByMapperFn<T, V, R>,
    ): GroupByReturnType<T, K, V, R>;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNestedValue = <T extends Record<string, any>, P extends string>(
  obj: T,
  path: P,
): NestedValue<T, P> | undefined => {
  let current = obj;

  for (const key of path.split(".")) {
    if (typeof current !== "object") {
      return undefined;
    }

    current = current[key];
  }

  return current as NestedValue<T, P> | undefined;
};



Object.defineProperty(Array.prototype, 'groupBy', {
  value: function groupByImpl<
  T,
  K extends null | (keyof T & (string | number)) | ((item: T) => string),
  V extends null | "[]" | NestedKeyOf<T> | `${NestedKeyOf<T>}[]` = null,
  R = never,
>(
  this: T[],
  fieldName: K,
  valueFieldName?: V,
  mapperFn?: GroupByMapperFn<T, V, R>,
) { 
  return this.reduce((acc, object, idx) => {
    const key = (
      fieldName === null
        ? object
        : typeof fieldName === "function"
          ? fieldName(object)
          : object[fieldName as keyof T & (string | number)]
    ) as GroupByKeyType<T, K>;
    
    if (valueFieldName === "[]" || valueFieldName?.endsWith("[]")) {
      if (!acc[key]) {
        (acc as Record<string, GroupByResultType<T, V, R>[]>)[key as string] = [];
      }
    }
    if (fieldName === null) {
      const value = (mapperFn || ((val) => val))(
        object as GroupByValueType<T, V> extends (infer U)[]
          ? U
          : V extends keyof T
            ? T[V]
            : T,
        idx,
      );
      if (valueFieldName === "[]") {
        (acc[key] as R[]).push(value as R);
      } else {
        acc[key] = value as GroupByResultType<T, V, R>;
      }
    }
    if (valueFieldName === "[]" || valueFieldName?.endsWith("[]")) {
      const extractedValue = valueFieldName === "[]"
        ? object
        : getNestedValue(object as Record<string, T>, valueFieldName.slice(0, -"[]".length));
      (acc[key] as R[]).push(
        (mapperFn || ((value) => value))(
          extractedValue as GroupByValueType<T, V> extends (infer U)[]
            ? U
            : V extends keyof T
              ? T[V]
              : T,
          idx,
        ) as R,
      );
    } else {
      const extractedValue = valueFieldName
        ? getNestedValue(object as Record<string, T>, valueFieldName)
        : object;
      acc[key] = (mapperFn || ((value) => value))(
        extractedValue as GroupByValueType<T, V> extends (infer U)[]
          ? U
          : V extends keyof T
            ? T[V]
            : T,
        idx,
      ) as GroupByResultType<T, V, R>;
    }
    return acc;
  }, {} as GroupByReturnType<T, K, V, R>);
},
  writable: true,
  enumerable: false,
  configurable: true,
});
export default {};
