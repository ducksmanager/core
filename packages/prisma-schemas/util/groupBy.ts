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
     */
    groupBy<
      K extends keyof T & string,
      V extends undefined | "[]" | (keyof T & string) | `${keyof T & string}[]` = undefined,
    >(
      fieldName: K,
      valueFieldName?: V,
    ): {
      [key: string]: V extends "[]"
      ? T[]
      : V extends `${infer U}[]`
      ? U extends keyof T
      ? T[U][]
      : never
      : V extends keyof T
      ? T[V]
      : T;
    };
  }
}

Array.prototype.groupBy = function (fieldName, valueFieldName) {
  return this.reduce(
    (acc, object) => ({
      ...acc,
      [object[fieldName]]:
        valueFieldName === "[]"
          ? [...(acc[object[fieldName]] || []), object]
          : valueFieldName?.endsWith("[]")
            ? [
              ...(acc[object[fieldName]] || []),
              object[valueFieldName.slice(0, -"[]".length)],
            ]
            : valueFieldName
              ? object[valueFieldName] || undefined
              : object,
    }),
    {},
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
[
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 3, name: "John" },
].groupBy("name");
// ^ inferred as Record<string, {id: number, name: string}>
// Output:{ John: { id: 3, name: 'John' }, Jane: { id: 2, name: 'Jane' } }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
[
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 3, name: "John" },
].groupBy("name", "[]");
// ^ inferred as Record<string, {id: number, name: string}[]>
// Output: { John: [{ id: 1, name: 'John' }, { id: 3, name: 'John' }], Jane: [{ id: 2, name: 'Jane' }] }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
[
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 3, name: "John" },
].groupBy("name", "id");
// ^ inferred as Record<string, number>
// Output: { John: 3, Jane: 2 }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
[
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 3, name: "John" },
].groupBy("name", "id[]");
// ^ inferred as Record<string, number[]>
// Output: { John: [1, 3], Jane: [2] }

export default {};