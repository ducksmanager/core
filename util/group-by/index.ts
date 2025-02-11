type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & string];

type GetNestedType<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? GetNestedType<T[K], R>
      : never
    : never;

type GroupByValueType<
  T,
  V extends
    | null
    | "[]"
    | NestedKeyOf<T>
    | `${NestedKeyOf<T>}[]` = null,
> = V extends null
  ? T
  : V extends "[]"
    ? T[]
    : V extends `${infer U}[]`
      ? U extends NestedKeyOf<T>
        ? GetNestedType<T, U>[]
        : never
      : V extends NestedKeyOf<T>
        ? GetNestedType<T, V>
        : never;

declare global {
  interface Array<T> {
    /**
     * Groups the elements of an array by a specified field name.
     *
     * @param fieldName - The field name to group by. If equal to null and the array to group by is an array of strings, the keys of the output array will be the values of the input array. Implies that the valueFieldName must be set to '[]' or null.
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
      K extends "" | (keyof T & (string | number)),
      V extends
        | null
        | "[]"
        | NestedKeyOf<T>
        | `${NestedKeyOf<T>}[]` = null,
      R = GroupByValueType<T, V>,
    >(
      fieldName: K,
      valueFieldName?: V,
      mapperFn?: (
        value: GroupByValueType<T, V> extends (infer U)[]
          ? U
          : V extends keyof T
            ? T[V]
            : T,
        index: number
      ) => R
    ): Record<
      K extends ""
        ? T & string
        : T[K & (keyof T & (string | number))] & (string | number),
      R
    >;
  }
}

const getNestedValue = <T, P extends string>(
  object: T,
  path: P
): GetNestedType<T, P> =>
  path
    .split(".")
    .reduce((acc, key) => (acc as any)[key], object) as GetNestedType<T, P>;

Array.prototype.groupBy = function (fieldName, mapper, mapperFn) {
  return this.reduce((acc, object, idx) => {
    const key = fieldName === "" ? object : object[fieldName];
    if (mapper === "[]" || mapper?.endsWith("[]")) {
      if (!acc[key]) {
        acc[key] = [];
      }
    }
    if (fieldName === "") {
      const value = (mapperFn || ((val) => val))(object, idx);
      if (mapper === "[]") {
        acc[key].push(value);
      } else {
        acc[key] = value;
      }
    }
    if (mapper === "[]" || mapper?.endsWith("[]")) {
      acc[key].push(
        (mapperFn || ((value) => value))(
          mapper === "[]"
            ? object
            : getNestedValue(object, mapper.slice(0, -"[]".length)),
          idx
        )
      );
    } else {
      acc[key] = (mapperFn || ((value) => value))(
        mapper ? getNestedValue(object, mapper) : object,
        idx
      );
    }
    return acc;
  }, {});
};
export default {};
