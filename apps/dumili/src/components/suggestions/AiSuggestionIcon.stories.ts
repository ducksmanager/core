import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AiSuggestionIcon from "./AiSuggestionIcon.vue";

const meta: Meta<typeof AiSuggestionIcon> = {
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    status: "idle",
  },
};

export const Success: Story = {
  args: {
    status: "success",
  },
};

export const Failure: Story = {
  args: {
    status: "failure",
  },
};

export const AsButton: Story = {
  args: {
    status: "idle",
    button: true,
  },
};

export const Loading: Story = {
  args: {
    status: "idle",
    isLoading: true,
  },
};

export const LoadingSuccess: Story = {
  args: {
    status: "success",
    isLoading: true,
  },
};

export const ButtonWithSuccess: Story = {
  args: {
    status: "success",
    button: true,
  },
};
