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
  render: (args) => ({
    components: { TableResults },
    setup() {
      return { args };
    },
    template: `
      <TableResults v-bind="args">
        <template #no-data>
          <p>No data available</p>
        </template>
      </TableResults>
    `,
  }),
};

export const SingleRow: Story = {
  args: {
    data: [{ id: 1, name: "Test", value: "123" }],
  },
};

export const ManyColumns: Story = {
  args: {
    data: [
      {
        id: 1,
        name: "Item 1",
        category: "A",
        price: 10.99,
        stock: 100,
        description: "First item",
      },
      {
        id: 2,
        name: "Item 2",
        category: "B",
        price: 20.99,
        stock: 50,
        description: "Second item",
      },
    ],
  },
};

