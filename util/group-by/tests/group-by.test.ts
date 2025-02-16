import { describe, expect, test } from "bun:test";
import "../index.ts";

describe("Array.groupBy", () => {
  const testData = [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
    { id: 3, name: "John" },
  ];

  test("groups by field name without a value field", () => {
    const result = testData.groupBy("name");
    expect(result).toEqual({
      John: { id: 3, name: "John" },
      Jane: { id: 2, name: "Jane" },
    });
  });

  test("groups by field name with an array value", () => {
    const result = testData.groupBy("name", "[]");
    expect(result).toEqual({
      John: [
        { id: 1, name: "John" },
        { id: 3, name: "John" },
      ],
      Jane: [{ id: 2, name: "Jane" }],
    });
  });

  test("groups by field name with a specific value field", () => {
    const result = testData.groupBy("name", "id");
    expect(result).toEqual({
      John: 3,
      Jane: 2,
    });
  });

  test("groups by field name with array of specific values", () => {
    const result = testData.groupBy("name", "id[]");
    expect(result).toEqual({
      John: [1, 3],
      Jane: [2],
    });
  });

  test("groups by field name with an array of values and a callback", () => {
    const result = testData.groupBy("name", "[]", ({id}) => id * 2);
    expect(result).toEqual({
      John: [2, 6],
      Jane: [4],
    });
  });

  test("groups by field name with an array of specific values and a callback", () => {
    const result = testData.groupBy("name", "id[]", (id) => id * 3);
    expect(result).toEqual({
      John: [3, 9],
      Jane: [6],
    });
  });

  test("groups by field name with a specific value and a callback", () => {
    const result = testData.groupBy("name", "id", (id) => id * 2);
    expect(result).toEqual({
      John: 6,
      Jane: 4,
    });
  });

  test("groups by field name with no specific value and a callback", () => {
    const result = testData.groupBy("name", null, ({id}) => id * 3);
    
    expect(result).toEqual({
      John: 9,
      Jane: 6,
    });
  });

  test("groups by field name using a sub-key", () => {
    const testDataWithSubKey = [{name: "John", "myKey": {"subKey": "myValue"}}, {name: "Jane", "myKey": {"subKey": "myOtherValue"}}]
    const result = testDataWithSubKey.groupBy("name", "myKey.subKey")
    expect(result).toEqual({
      John: "myValue",
      Jane: "myOtherValue",
    });
  });

  test("groups by field name using a sub-key array", () => {
    const testDataWithSubKey = [{name: "John", "myKey": {"subKey": "myValue"}}, {name: "John", "myKey": {"subKey": "myOtherValue"}}]
    const result = testDataWithSubKey.groupBy("name", "myKey.subKey[]")
    expect(result).toEqual({John: ["myValue", 'myOtherValue']});
  });

  test("groups by field name using an array of strings and a callback", () => {
    const testDataWithSubKey = ["John", "Jane"]
    const result = testDataWithSubKey.groupBy(null, null, (name, index) => ({ name, id: index+1 }));
    expect(result).toEqual({ John: {name: 'John', id: 1}, Jane: {name: 'Jane', id: 2} });
  });
});
