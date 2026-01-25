import preview from "../../../.storybook/preview";
import IssueSuggestionList from "./IssueSuggestionList.vue";
import type { FullIndexation } from "~dumili-services/indexation";
import { createIndexationDecorator } from "../../../.storybook/utils/mocks";

const meta = preview.meta({
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
});

const createDecorator = (indexationOverrides: Partial<FullIndexation> = {}) =>
  createIndexationDecorator(indexationOverrides, { initializeSocket: true });

export const Default = meta.story({
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
});

export const WithSelected = meta.story({
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
});
