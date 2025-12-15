import { markRaw } from "vue";
import { defineStore } from "pinia";

import ArcCircle from "../components/renders/ArcCircle.vue";
import Fill from "../components/renders/Fill.vue";
import Gradient from "../components/renders/Gradient.vue";
import Image from "../components/renders/Image.vue";
import Polygon from "../components/renders/Polygon.vue";
import Rectangle from "../components/renders/Rectangle.vue";
import Staple from "../components/renders/Staple.vue";
import Text from "../components/renders/Text.vue";

export const renders = defineStore("renders", () => ({
  supportedRenders: {
    Rectangle: {
      component: markRaw(Rectangle),
      description: "Draw a rectangle",
    },
    Staple: {
      component: markRaw(Staple),
      originalName: "Agrafer",
      description: "Staple the edge",
    },
    Gradient: {
      component: markRaw(Gradient),
      originalName: "Degrade",
      description: "Draw a rectangle with a gradient",
    },
    Polygon: {
      component: markRaw(Polygon),
      originalName: "Polygone",
      description: "Draw a polygon",
    },
    ArcCircle: {
      component: markRaw(ArcCircle),
      originalName: "Arc_cercle",
      description: "Draw a circle arc",
    },
    Image: {
      component: markRaw(Image),
      description: "Insert an image",
    },
    Fill: {
      component: markRaw(Fill),
      originalName: "Remplir",
      description: "Fill with a color",
    },
    Text: {
      component: markRaw(Text),
      originalName: "TexteMyFonts",
      description: "Insert a text",
    },
  } as const,
}));
