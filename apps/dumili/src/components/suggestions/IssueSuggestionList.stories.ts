import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IssueSuggestionList from "./IssueSuggestionList.vue";
import type { FullIndexation } from "~dumili-services/indexation";
import { createIndexationDecorator } from "../../../.storybook/utils/mocks";

const meta: Meta<typeof IssueSuggestionList> = {
  title: "Components/suggestions/IssueSuggestionList",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: {
        inline: false,
        iframeHeight: 200,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createDecorator = (indexationOverrides: Partial<FullIndexation> = {}) =>
  createIndexationDecorator(indexationOverrides, { initializeSocket: true });

export const Default: Story = {
  decorators: [
    createDecorator({
      issueSuggestions: [
        {
          id: 1,
          publicationcode: "us/DD",
          issuenumber: "1",
          aiStorySearchPossibleStoryId: null,
          indexationId: "mock-indexation-id",
        },
        {
          id: 2,
          publicationcode: "fr/PM",
          issuenumber: "500",
          aiStorySearchPossibleStoryId: 1,
          indexationId: "mock-indexation-id",
        },
      ],
    }),
  ],
  render: () => ({
    components: { IssueSuggestionList },
    template: `
      <div style="width: 300px; position: relative;">
        <IssueSuggestionList />
      </div>
    `,
  }),
};

export const WithSelected: Story = {
  decorators: [
    createDecorator({
      issueSuggestions: [
        {
          id: 1,
          publicationcode: "us/DD",
          issuenumber: "1",
          aiStorySearchPossibleStoryId: null,
          indexationId: "mock-indexation-id",
        },
        {
          id: 2,
          publicationcode: "fr/PM",
          issuenumber: "500",
          aiStorySearchPossibleStoryId: 1,
          indexationId: "mock-indexation-id",
        },
      ],
      acceptedIssueSuggestion: {
        id: 1,
        publicationcode: "us/DD",
        issuenumber: "1",
        aiStorySearchPossibleStoryId: null,
        indexationId: "mock-indexation-id",
      },
    }),
  ],
  render: () => ({
    components: { IssueSuggestionList },
    template: `
      <div style="width: 300px; position: relative;">
        <IssueSuggestionList />
      </div>
    `,
  }),
};
