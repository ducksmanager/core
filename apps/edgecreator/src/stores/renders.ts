import { defineStore } from "pinia";
import ArcCircle from "../components/renders/ArcCircle.vue";
import Rectangle from "../components/renders/Rectangle.vue";
import Staple from "../components/renders/Staple.vue";
import Gradient from "../components/renders/Gradient.vue";
import Polygon from "../components/renders/Polygon.vue";
import Image from "../components/renders/Image.vue";
import Fill from "../components/renders/Fill.vue";
import Text from "../components/renders/Text.vue";

export const renders = defineStore("renders", () => ({
  supportedRenders: {
    Rectangle: {
      component: Rectangle,
      description: "Draw a rectangle",
    },
    Staple: {
      component: Staple,
      originalName: "Agrafer",
      description: "Staple the edge",
    },
    Gradient: {
      component: Gradient,
      originalName: "Degrade",
      description: "Draw a rectangle with a gradient",
    },
    Polygon: {
      component: Polygon,
      originalName: "Polygone",
      description: "Draw a polygon",
    },
    ArcCircle: {
      component: ArcCircle,
      originalName: "Arc_cercle",
      description: "Draw a circle arc",
    },
    Image: {
      component: Image,
      description: "Insert an image",
    },
    Fill: {
      component: Fill,
      originalName: "Remplir",
      description: "Fill with a color",
    },
    Text: {
      component: Text,
      originalName: "TexteMyFonts",
      description: "Insert a text",
    },
  } as const,
}));
