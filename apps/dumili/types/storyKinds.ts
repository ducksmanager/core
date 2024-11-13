import type { storyKind } from "~prisma/client_dumili";

export const STORY = "n";
export const NEWSPAPER_STRIP = "k";
export const COVER = "c";
export const ILLUSTRATION = "i";
export const GAME_OR_PUZZLE = "g";
export const TEXT_STORY = "t";
export const ARTICLE = "a";
export const PAINTING_PORTRAIT = "P";
export const PAINTING_LANDSCAPE = "L";
export const CENTERFOLD = "f";

export const storyKinds: Record<storyKind, string> = {
  [STORY]: "Story",
  [NEWSPAPER_STRIP]: "Newspaper strip",
  [COVER]: "Cover",
  [ILLUSTRATION]: "Illustration",
  [GAME_OR_PUZZLE]: "Game or puzzle",
  [TEXT_STORY]: "Text story",
  [ARTICLE]: "Article",
  [PAINTING_PORTRAIT]: "Painting (portrait)",
  [PAINTING_LANDSCAPE]: "Painting (landscape)",
  [CENTERFOLD]: "Centerfold",
} as const;
