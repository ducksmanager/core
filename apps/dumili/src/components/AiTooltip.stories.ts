import preview from "../../.storybook/preview";
import AiTooltip from "./AiTooltip.vue";

type AiTooltipArgs = {
  id: string;
  status: "success" | "failure" | "idle";
  loadingEvents?: Array<{
    eventName: string;
    checkMatch: (id: number) => boolean;
  }>;
};

// No `component` → argTypes-only args infer as `unknown`; narrow args for Storybook 10+ CSF typing.
const meta = preview.type<{ args: AiTooltipArgs }>().meta({
  title: "Components/AiTooltip",
  tags: ["autodocs"],
  argTypes: {
    id: {
      control: "text",
      description: "Unique identifier for the tooltip",
    },
    status: {
      control: "select",
      options: ["success", "failure", "idle"],
      description: "The status of the AI suggestion",
    },
    loadingEvents: {
      control: false,
      description: "Array of loading events to watch",
    },
  },
});

const renderTooltip = (content: string) => (args: AiTooltipArgs) => ({
  components: { AiTooltip },
  setup() {
    return { args };
  },
  template: `
    <div style="position: relative; width: 200px; height: 100px; padding: 20px;">
      <AiTooltip
        :id="args.id"
        :status="args.status"
        :loading-events="args.loadingEvents"
      >
        <div style="padding: 10px;">
          ${content}
        </div>
      </AiTooltip>
    </div>
  `,
});

export const Success = meta.story({
  args: {
    id: "ai-tooltip-success",
    status: "success",
  },
  render: renderTooltip(`
    <strong>AI Results</strong>
    <p>This is a success tooltip with AI results.</p>
  `),
});

export const Failure = meta.story({
  args: {
    id: "ai-tooltip-failure",
    status: "failure",
  },
  render: renderTooltip(`
    <strong>Error</strong>
    <p>AI processing failed. Please try again.</p>
  `),
});

export const Idle = meta.story({
  args: {
    id: "ai-tooltip-idle",
    status: "idle",
  },
  render: renderTooltip(`
    <strong>Waiting</strong>
    <p>AI processing has not started yet.</p>
  `),
});

export const WithLoadingEvents = meta.story({
  args: {
    id: "ai-tooltip-loading",
    status: "idle",
    loadingEvents: [
      {
        eventName: "reportSetInferredEntryStoryKind" as const,
        checkMatch: (id: number) => id === 1,
      },
    ],
  },
  render: renderTooltip(`
    <strong>Loading</strong>
    <p>This tooltip watches for loading events.</p>
  `),
});
