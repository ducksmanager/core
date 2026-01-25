import preview from "../../.storybook/preview";
import StorySearch from "./StorySearch.vue";

const meta = preview.meta({
  title: "Components/StorySearch",
  tags: ["autodocs"],
  argTypes: {
    kind: {
      control: "select",
      options: ["n", "c", null],
      description: "Filter by story kind",
    },
  },
});

const render = (args: { kind?: string }) => ({
  components: { StorySearch },
  setup: () => ({ args }),
  template: `
    <div class="row" style="height: 200px;">
      <StorySearch :kind="args.kind" />
    </div>
  `,
});

export const Default = meta.story({
  args: {
    kind: undefined,
  },
  render,
});

export const WithKindFilter = meta.story({
  args: {
    kind: "n" as const,
  },
  render,
});
