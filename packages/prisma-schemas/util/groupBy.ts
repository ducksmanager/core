declare global {
  interface Array<T> {
    /**
     * Groups the elements of an array by a specified field name.
     * 
     * @param fieldName - The field name to group by.
     * @param valueFieldName - Optional. The field name to use as the value in the grouped result.
     *                         If not provided, the entire object will be used as the value.
     *                         If set to '[]', an array of objects with the same field name will be used as the value.
     * @returns An object with the grouped elements.
     * @example
     * // returns { John: { id: 3, name: 'John' }, Jane: { id: 2, name: 'Jane' } }
     * [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'John' }]
     *      .groupBy('name');
     * 
     * @example
     * // returns { John: [{ id: 1, name: 'John' }, { id: 3, name: 'John' }], Jane: [{ id: 2, name: 'Jane' }] }
     * [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'John' }]
     *      .groupBy('name', '[]);
     * 
     * @example
     * // returns { John: 28, Jane: 30 }
     * [{ id: 1, name: 'John', age: 25 }, { id: 2, name: 'Jane', age: 30 }, { id: 3, name: 'John', age: 28 }]
     *      .groupBy('name', 'age');
     */
    groupBy<K extends keyof T, V extends undefined | '[]' | keyof T = undefined>(
      fieldName: K,
      valueFieldName?: V,
    ): { [key: string]: V extends '[]' ? T[] : V extends keyof T ? T[V] : T };
  }
}

Array.prototype.groupBy = function (fieldName, valueFieldName) {
  return this.reduce(
    (acc, object) => ({
      ...acc,
      [object[fieldName]]: valueFieldName === '[]' ? [...acc[object[fieldName]] || [], object] : valueFieldName
        ? object[valueFieldName] || undefined
        : object,
    }),
    {},
  );
};

export default {};
