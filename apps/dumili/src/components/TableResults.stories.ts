import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TableResults from "./TableResults.vue";

const meta: Meta<typeof TableResults> = {
  title: "Components/TableResults",
  component: TableResults,
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: "object",
      description: "Array of objects to display in the table",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      { name: "John", age: 30, city: "New York" },
      { name: "Jane", age: 25, city: "London" },
      { name: "Bob", age: 35, city: "Paris" },
    ],
  },
};

export const Empty: Story = {
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
};

export const SingleRow: Story = {
  args: {
    data: [{ id: 1, status: "active", count: 42 }],
  },
};

export const WithNoDataSlot: Story = {
  args: {
    data: [],
    $slots: {
      "no-data": "No results found",
    },
  },
};
