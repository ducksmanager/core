import { defineStore } from "pinia";

export const renders = defineStore("renders", {
  state: () => ({
    supportedRenders: [
      {
        component: "Rectangle",
        labelL10nKey: "Rectangle",
        originalName: "Rectangle",
        description: "Draw a rectangle",
      },
      {
        component: "Staple",
        labelL10nKey: "Staple",
        originalName: "Agrafer",
        description: "Staple the edge",
      },
      {
        component: "Gradient",
        labelL10nKey: "Gradient",
        originalName: "Degrade",
        description: "Draw a rectangle with a gradient",
      },
      {
        component: "Polygon",
        labelL10nKey: "Polygon",
        originalName: "Polygone",
        description: "Draw a polygon",
      },
      {
        component: "ArcCircle",
        labelL10nKey: "Arc circle",
        originalName: "Arc_cercle",
        description: "Draw a circle arc",
      },
      {
        component: "Image",
        labelL10nKey: "Image",
        originalName: "Image",
        description: "Insert an image",
      },
      {
        component: "Fill",
        labelL10nKey: "Fill",
        originalName: "Remplir",
        description: "Fill with a color",
      },
      {
        component: "Text",
        labelL10nKey: "Text",
        originalName: "TexteMyFonts",
        description: "Insert a text",
      },
    ] as {
      component: string;
      labelL10nKey: string;
      originalName: string;
      description: string;
    }[],
  }),
});
