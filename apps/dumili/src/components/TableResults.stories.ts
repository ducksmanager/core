import preview from "../../.storybook/preview";
import TableResults from "./TableResults.vue";

const meta = preview.meta({
  title: "Components/TableResults",
  component: TableResults,
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: "object",
      description: "Array of objects to display in the table",
    },
  },
});

export const Default = meta.story({
  args: {
    data: [
      { name: "John", age: 30, city: "New York" },
      { name: "Jane", age: 25, city: "London" },
      { name: "Bob", age: 35, city: "Paris" },
    ],
  },
});

export const Empty = meta.story({
  args: {
    data: [],
  },
  parameters: {
    docs: {
      description: {
        story: "When data is empty, the 'no-data' slot is shown",
      },
    },
  },
});

export const SingleRow = meta.story({
  args: {
    data: [{ id: 1, status: "active", count: 42 }],
  },
});

export const WithNoDataSlot = meta.story({
  args: {
    data: [],
    $slots: {
      "no-data": "No results found",
    },
  },
});
