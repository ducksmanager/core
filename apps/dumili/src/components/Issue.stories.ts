import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Issue from "./Issue.vue";

const meta: Meta<typeof Issue> = {
  title: "Components/Issue",
  component: Issue,
  tags: ["autodocs"],
  argTypes: {
    issue: {
      control: "object",
      description: "The issue object with publicationcode and issuenumber",
    },
    noWrap: {
      control: "boolean",
      description: "Whether to display inline or block",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    issue: {
      publicationcode: "us/DD",
      issuenumber: "1",
    },
    noWrap: false,
  },
};

export const Inline: Story = {
  args: {
    issue: {
      publicationcode: "fr/PM",
      issuenumber: "123",
    },
    noWrap: true,
  },
};

export const Unknown: Story = {
  args: {
    issue: undefined,
  },
};

export const WithSlot: Story = {
  args: {
    issue: {
      publicationcode: "us/DD",
      issuenumber: "1",
    },
  },
  render: (args) => ({
    components: { Issue },
    setup() {
      return { args };
    },
    template: `
      <Issue v-bind="args">
        <template #title-suffix>
          <span class="ms-1 text-muted">(1924)</span>
        </template>
        <span class="ms-2">- A special issue</span>
      </Issue>
    `,
  }),
};
