import type { IndexationAiContext } from "../context";
import { runKumikoOnPages } from "../kumiko";
import { setInferredEntriesStoryKinds } from "./story-kinds";
import { createAiStorySuggestions } from "./story-suggestions";

export const runIndexationAi = async (ctx: IndexationAiContext) => {
  await runKumikoOnPages(ctx);
  await setInferredEntriesStoryKinds(ctx);
  await createAiStorySuggestions(ctx);
};

export { setInferredEntriesStoryKinds } from "./story-kinds";
export { createAiStorySuggestions } from "./story-suggestions";
