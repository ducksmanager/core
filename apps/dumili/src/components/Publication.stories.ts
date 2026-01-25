import preview from "../../.storybook/preview";
import Publication from "./Publication.vue";

const meta = preview.meta({
  title: "Components/Publication",
  component: Publication,
  tags: ["autodocs"],
  argTypes: {
    publicationcode: {
      control: "text",
      description: "The publication code (e.g., 'us/DD' or 'fr/PM')",
    },
    publicationname: {
      control: "text",
      description: "The display name of the publication",
    },
    displayClass: {
      control: "select",
      options: ["d-inline-flex", "d-flex", "d-block"],
      description: "The CSS display class",
    },
  },
});

export const Default = meta.story({
  args: {
    publicationcode: "us/DD",
    publicationname: "Donald Duck",
    displayClass: "d-inline-flex",
  },
});

export const Large = meta.story({
  args: {
    publicationcode: "fr/PM",
    publicationname: "Picsou Magazine",
    displayClass: "d-inline-flex",
  },
});

export const Small = meta.story({
  args: {
    publicationcode: "dk/AND",
    publicationname: "Anders And & Co.",
    displayClass: "d-inline-flex",
  },
});

export const WithSlot = meta.story({
  args: {
    publicationcode: "us/DD",
    publicationname: "Donald Duck",
    displayClass: "d-inline-flex",
  },
  render: (args) => ({
    components: { Publication },
    setup: () => ({ args }),
    template: `
      <Publication v-bind="args">
        <span class="ms-2 text-muted">(1934-)</span>
      </Publication>
    `,
  }),
});
