import preview from "../../.storybook/preview";
import { ref } from "vue";
import SuggestionList from "./SuggestionList.vue";

// Mock suggestion type for stories
type MockSuggestion = {
  id: number;
  name: string;
  isAi?: boolean;
};

const meta = preview.meta({
  title: "Components/SuggestionList",
  // component is omitted to avoid generic type issues
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    // Set minimum height for the story container
    docs: {
      story: {
        inline: false,
        iframeHeight: 200,
      },
    },
  },
  argTypes: {
    suggestions: {
      control: "object",
      description: "Array of suggestions to display",
    },
    isAiSource: {
      control: false,
      description: "Function to determine if a suggestion is from AI",
    },
    showCustomizeForm: {
      control: "boolean",
      description: "Whether to show the customize form",
    },
  },
});

const mockSuggestions: MockSuggestion[] = [
  { id: 1, name: "Suggestion 1", isAi: false },
  { id: 2, name: "Suggestion 2", isAi: false },
  { id: 3, name: "AI Suggestion 1", isAi: true },
  { id: 4, name: "AI Suggestion 2", isAi: true },
];

export const Default = meta.story({
  args: {
    suggestions: mockSuggestions,
    isAiSource: (suggestion: MockSuggestion) => suggestion.isAi === true,
  },
  // @ts-expect-error - SuggestionList is a generic component, TypeScript can't properly infer its type in Storybook
  render: (args) => ({
    components: { SuggestionList },
    setup() {
      const current = ref<MockSuggestion | null>(null);
      return {
        args,
        current,
      };
    },
    template: `
      <div style="width: 300px; position: relative;">
        <SuggestionList
          v-model="current"
          :suggestions="args.suggestions"
          :is-ai-source="args.isAiSource"
          :show-customize-form="args.showCustomizeForm"
        >
          <template #default="{ suggestion }">
            {{ suggestion.name }}
          </template>
          <template #unknown-text>Unknown</template>
        </SuggestionList>
      </div>
    `,
  }),
});

export const WithSelected = meta.story({
  args: {
    suggestions: mockSuggestions,
    isAiSource: (suggestion: MockSuggestion) => suggestion.isAi === true,
  },
  // @ts-expect-error - SuggestionList is a generic component, TypeScript can't properly infer its type in Storybook
  render: (args) => ({
    components: { SuggestionList },
    setup() {
      const current = ref<MockSuggestion | null>(mockSuggestions[0]);
      return {
        args,
        current,
      };
    },
    template: `
      <div style="width: 300px; position: relative;">
        <SuggestionList
          v-model="current"
          :suggestions="args.suggestions"
          :is-ai-source="args.isAiSource"
          :show-customize-form="args.showCustomizeForm"
        >
          <template #default="{ suggestion }">
            {{ suggestion.name }}
          </template>
          <template #unknown-text>Unknown</template>
        </SuggestionList>
      </div>
    `,
  }),
});

export const WithCustomizeForm = meta.story({
  args: {
    suggestions: mockSuggestions,
    isAiSource: (suggestion: MockSuggestion) => suggestion.isAi === true,
    showCustomizeForm: true,
  },
  // @ts-expect-error - SuggestionList is a generic component, TypeScript can't properly infer its type in Storybook
  render: (args) => ({
    components: { SuggestionList },
    setup() {
      const current = ref<MockSuggestion | null>(null);
      return {
        args,
        current,
      };
    },
    template: `
      <div style="width: 300px; position: relative;">
        <SuggestionList
          v-model="current"
          :suggestions="args.suggestions"
          :is-ai-source="args.isAiSource"
          :show-customize-form="args.showCustomizeForm"
        >
          <template #default="{ suggestion }">
            {{ suggestion.name }}
          </template>
          <template #unknown-text>Unknown</template>
          <template #customize-text>Customize...</template>
          <template #customize-form>
            <div style="padding: 10px; background: #f0f0f0;">
              Customize form content
            </div>
          </template>
        </SuggestionList>
      </div>
    `,
  }),
});

export const OnlyUserSuggestions = meta.story({
  args: {
    suggestions: mockSuggestions.filter((s) => !s.isAi),
    isAiSource: (suggestion: MockSuggestion) => suggestion.isAi === true,
  },
  // @ts-expect-error - SuggestionList is a generic component, TypeScript can't properly infer its type in Storybook
  render: (args) => ({
    components: { SuggestionList },
    setup() {
      const current = ref<MockSuggestion | null>(null);
      return {
        args,
        current,
      };
    },
    template: `
      <div style="width: 300px; position: relative;">
        <SuggestionList
          v-model="current"
          :suggestions="args.suggestions"
          :is-ai-source="args.isAiSource"
          :show-customize-form="args.showCustomizeForm"
        >
          <template #default="{ suggestion }">
            {{ suggestion.name }}
          </template>
          <template #unknown-text>Unknown</template>
        </SuggestionList>
      </div>
    `,
  }),
});

export const OnlyAiSuggestions = meta.story({
  args: {
    suggestions: mockSuggestions.filter((s) => s.isAi),
    isAiSource: (suggestion: MockSuggestion) => suggestion.isAi === true,
  },
  // @ts-expect-error - SuggestionList is a generic component, TypeScript can't properly infer its type in Storybook
  render: (args) => ({
    components: { SuggestionList },
    setup() {
      const current = ref<MockSuggestion | null>(null);
      return {
        args,
        current,
      };
    },
    template: `
      <div style="width: 300px; position: relative;">
        <SuggestionList
          v-model="current"
          :suggestions="args.suggestions"
          :is-ai-source="args.isAiSource"
          :show-customize-form="args.showCustomizeForm"
        >
          <template #default="{ suggestion }">
            {{ suggestion.name }}
          </template>
          <template #unknown-text>Unknown</template>
        </SuggestionList>
      </div>
    `,
  }),
});
