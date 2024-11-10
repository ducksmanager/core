import { storyKind } from "~prisma/client_dumili";

export const storyKinds: Record<storyKind, string> = {
  n: "Story",
  k: "Newspaper strip",
  c: "Cover",
  i: "Illustration",
  g: "Game or puzzle",
  t: "Text story",
  a: "Article",
  P: "Painting (portrait)",
  L: "Painting (landscape)",
  f: "Centerfold",
} as const;
