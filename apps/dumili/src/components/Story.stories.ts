import preview from "../../.storybook/preview";
import type { StoryObj } from "@storybook/vue3-vite";
import Story from "./Story.vue";

const meta = preview.meta({
  title: "Components/Story",
  component: Story,
  tags: ["autodocs"],
  argTypes: {
    storycode: {
      control: "text",
      description: "The story code (e.g., 'I TL  116-AP')",
    },
  },
});

type Story = StoryObj<typeof meta>;

export const Default = meta.story({
  args: {
    storycode: "I TL  116-AP",
  },
});

export const WithoutTitle = meta.story({
  args: {
    storycode: "I TL 9999-Z",
  },
});

export const WithSuffix = meta.story({
  args: {
    storycode: "I TL  116-AP",
  },
  render: (args) => ({
    components: { Story },
    setup: () => ({ args }),
    template: `
      <Story v-bind="args">
        <template #suffix>
          <span class="ms-2 text-muted">(1924)</span>
        </template>
      </Story>
    `,
  }),
});
