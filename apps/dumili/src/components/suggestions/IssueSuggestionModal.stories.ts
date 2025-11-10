import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IssueSuggestionModal from "./IssueSuggestionModal.vue";
import { createIndexationDecorator } from "../../../../.storybook/utils/mocks";

const meta: Meta<typeof IssueSuggestionModal> = {
  title: "Components/suggestions/IssueSuggestionModal",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    createIndexationDecorator(
      {
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
      },
      { initializeSocket: true },
    ),
  ],
  render: () => ({
    components: { IssueSuggestionModal },
    template: `
      <div style="width: 100%; height: 400px; position: relative;">
        <IssueSuggestionModal />
      </div>
    `,
  }),
};
