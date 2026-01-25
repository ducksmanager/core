import preview from "../../../.storybook/preview";
import AiSuggestionIcon from "./AiSuggestionIcon.vue";

const meta = preview.meta({
  title: "Components/suggestions/AiSuggestionIcon",
  component: AiSuggestionIcon,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["success", "failure", "idle"],
      description: "The status of the AI suggestion",
    },
    button: {
      control: "boolean",
      description: "Whether to display as a button",
    },
    isLoading: {
      control: "boolean",
      description: "Whether the icon is in a loading state",
    },
    id: {
      control: "text",
      description: "Optional ID for the icon element",
    },
  },
});

export const Idle = meta.story({
  args: {
    status: "idle",
  },
});

export const Success = meta.story({
  args: {
    status: "success",
  },
});

export const Failure = meta.story({
  args: {
    status: "failure",
  },
});

export const AsButton = meta.story({
  args: {
    status: "idle",
    button: true,
  },
});

export const Loading = meta.story({
  args: {
    status: "idle",
    isLoading: true,
  },
});

export const LoadingSuccess = meta.story({
  args: {
    status: "success",
    isLoading: true,
  },
});

export const ButtonWithSuccess = meta.story({
  args: {
    status: "success",
    button: true,
  },
});
