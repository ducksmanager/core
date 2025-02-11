type GroupByValueType<
  T,
  V extends
    | undefined
    | "[]"
    | (keyof T & string)
    | `${keyof T & string}[]` = undefined,
> = V extends undefined
  ? T
  : V extends "[]"
    ? T[]
    : V extends `${infer U}[]`
      ? U extends keyof T
        ? T[U][]
        : never
      : V extends keyof T
        ? T[V]
        : never;

declare global {
  interface Array<T> {
    /**
     * Groups the elements of an array by a specified field name.
     *
     * @param fieldName - The field name to group by.
     * @param valueFieldName - Optional. The field name to use as the value in the grouped result.
     *                         If not provided, the entire object will be used as the value.
     *                         If set to '[]', an array of objects will be used as the value.
     *                         If set to 'myField[]', an array of values of myField will be used as the value.
     * @param mapperFn - Optional. If set, each value will be passed to the function and the result will be used as the value or an array of values (depending on the value of valueFieldName).
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
     */
    groupBy<
      K extends keyof T & string,
      V extends
        | undefined
        | "[]"
        | (keyof T & string)
        | `${keyof T & string}[]` = undefined,
      R = any,
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
      T[K] & (string | number),
      typeof mapperFn extends undefined ? GroupByValueType<T, V> : R
    >;
  }
}

Array.prototype.groupBy = function (fieldName, mapper, mapperFn) {
  return this.reduce((acc, object, idx) => {
    const key = object[fieldName];
    if (mapper === "[]" || mapper?.endsWith("[]")) {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(
        (mapperFn || ((value) => value))(
          mapper === "[]" ? object : object[mapper.slice(0, -"[]".length)],
          idx
        )
      );
    } else {
      acc[key] = (mapperFn || ((value) => value))(
        mapper ? object[mapper] : object,
        idx
      );
    }
    return acc;
  }, {});
};
export default {};
