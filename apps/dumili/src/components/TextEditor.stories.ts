import preview from "../../.storybook/preview";
import TextEditor from "./TextEditor.vue";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";

const meta = preview.meta({
  title: "Components/TextEditor",
  tags: ["autodocs"],
});

export const Default = meta.story({
  decorators: [
    createIndexationDecorator(
      {
        pages: [
          createMockPage({ id: 1, pageNumber: 1 }),
          createMockPage({ id: 2, pageNumber: 2 }),
        ],
        entries: [
          createMockEntry({
            id: 1,
            position: 1,
            entirepages: 1,
            acceptedStory: {
              id: 1,
              storycode: "I TL  116-AP",
              aiStorySuggestionId: null,
              entryId: 1,
            },
            acceptedStoryKind: {
              id: 1,
              storyKindRowsStr: "n1",
              entryId: 1,
              aiKumikoResultId: null,
              storyKindRows: {
                id: "1",
                kind: "n" as const,
                numberOfRows: 2,
              },
            },
          }),
          createMockEntry({
            id: 2,
            position: 3,
            entirepages: 2,
            acceptedStory: {
              id: 2,
              storycode: "I TL  5678-B",
              aiStorySuggestionId: null,
              entryId: 2,
            },
          }),
        ],
        acceptedIssueSuggestion: {
          id: 1,
          publicationcode: "us/DD",
          issuenumber: "1",
          aiStorySearchPossibleStoryId: null,
          indexationId: "mock-indexation-id",
        },
      },
      { initializeSocket: true },
    ),
  ],
  render: () => ({
    components: { TextEditor },
    template: `
      <div style="width: 100%; height: 400px;">
        <TextEditor />
      </div>
    `,
  }),
});
