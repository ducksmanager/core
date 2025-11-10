import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IssueSelect from "./IssueSelect.vue";

const meta: Meta<typeof IssueSelect> = {
  title: "Components/IssueSelect",
  tags: ["autodocs"],
  argTypes: {
    issue: {
      control: "object",
      description: "The current issue selection",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    issue: null,
  },
  render: (args) => ({
    components: { IssueSelect },
    setup: () => ({ args }),
    template: `
      <div style="width: 400px; padding: 20px;">
        <IssueSelect :issue="args.issue" />
      </div>
    `,
  }),
};

export const WithIssue: Story = {
  args: {
    issue: {
      publicationcode: "us/DD",
      issuenumber: "1",
    },
  },
  render: (args) => ({
    components: { IssueSelect },
    setup: () => ({ args }),
    template: `
      <div style="width: 400px; padding: 20px;">
        <IssueSelect :issue="args.issue" />
      </div>
    `,
  }),
};
