import type { Meta, StoryObj } from "@storybook/vue3-vite";
import StorySearch from "./StorySearch.vue";

const meta: Meta<typeof StorySearch> = {
  title: "Components/StorySearch",
  tags: ["autodocs"],
  argTypes: {
    kind: {
      control: "select",
      options: ["n", "c", null],
      description: "Filter by story kind",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: { kind?: string }) => ({
  components: { StorySearch },
  setup: () => ({ args }),
  template: `
    <div class="row" style="height: 200px;">
      <StorySearch :kind="args.kind" />
    </div>
  `,
});

export const Default: Story = {
  args: {
    kind: undefined,
  },
  render,
};

export const WithKindFilter: Story = {
  args: {
    kind: "n" as const,
  },
  render,
};
