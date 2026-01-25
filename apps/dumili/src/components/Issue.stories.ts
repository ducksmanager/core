import preview from "../../.storybook/preview";
import Issue from "./Issue.vue";

const meta = preview.meta({
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
});

export const Default = meta.story({
  args: {
    issue: {
      publicationcode: "us/DD",
      issuenumber: "1",
    },
    noWrap: false,
  },
});

export const Inline = meta.story({
  args: {
    issue: {
      publicationcode: "fr/PM",
      issuenumber: "123",
    },
    noWrap: true,
  },
});

export const Unknown = meta.story({
  args: {
    issue: undefined,
  },
});

export const WithSlot = meta.story({
  args: {
    issue: {
      publicationcode: "us/DD",
      issuenumber: "1",
    },
  },
  render: (args) => ({
    components: { Issue },
    setup: () => ({ args }),
    template: `
      <Issue v-bind="args">
        <template #title-suffix>
          <span class="ms-1 text-muted">(1924)</span>
        </template>
        <span class="ms-2">- A special issue</span>
      </Issue>
    `,
  }),
});
