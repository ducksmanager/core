import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { storeToRefs } from "pinia";
import IssueSuggestionList from "./IssueSuggestionList.vue";
import { suggestions } from "~/stores/suggestions";
import type { FullIndexation } from "~dumili-services/indexation";

const meta: Meta<typeof IssueSuggestionList> = {
  title: "Components/suggestions/IssueSuggestionList",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockIndexation = (
  overrides: Partial<FullIndexation> = {},
): FullIndexation => {
  const base: FullIndexation = {
    id: "mock-indexation-id",
    dmUserId: 1,
    acceptedIssueSuggestionId: null,
    title: null,
    releaseDate: null,
    price: null,
    user: {
      dmId: 1,
      inducksUsername: "mock-user",
    },
    issueSuggestions: [],
    acceptedIssueSuggestion: null,
    pages: [],
    entries: [],
  };
  return Object.assign(base, overrides);
};

export const Default: Story = {
  render: () => {
    const suggestionsStore = suggestions();
    const indexation = createMockIndexation({
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
    });
    // Set the reactive ref value before component renders
    const { indexation: indexationRef } = storeToRefs(suggestionsStore);
    indexationRef.value = indexation;

    return {
      components: { IssueSuggestionList },
      template: `
        <div style="width: 300px; position: relative;">
          <IssueSuggestionList />
        </div>
      `,
    };
  },
};

export const WithSelected: Story = {
  render: () => {
    const suggestionsStore = suggestions();
    const acceptedIssueSuggestion = {
      id: 1,
      publicationcode: "us/DD",
      issuenumber: "1",
      aiStorySearchPossibleStoryId: null,
      indexationId: "mock-indexation-id",
    };
    const indexation = createMockIndexation({
      issueSuggestions: [
        acceptedIssueSuggestion,
        {
          id: 2,
          publicationcode: "fr/PM",
          issuenumber: "500",
          aiStorySearchPossibleStoryId: 1,
          indexationId: "mock-indexation-id",
        },
      ],
      acceptedIssueSuggestion,
    });
    // Set the reactive ref value before component renders
    const { indexation: indexationRef } = storeToRefs(suggestionsStore);
    indexationRef.value = indexation;

    return {
      components: { IssueSuggestionList },
      template: `
        <div style="width: 300px; position: relative;">
          <IssueSuggestionList />
        </div>
      `,
    };
  },
};
