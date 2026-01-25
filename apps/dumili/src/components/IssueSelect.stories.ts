import preview from "../../.storybook/preview";
import IssueSelect from "./IssueSelect.vue";

const meta = preview.meta({
  title: "Components/IssueSelect",
  tags: ["autodocs"],
  argTypes: {
    issue: {
      control: "object",
      description: "The current issue selection",
    },
  },
});

export const Default = meta.story({
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
});

export const WithIssue = meta.story({
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
});
