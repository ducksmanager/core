import type { IndexationAiContext } from "../context";
import { runKumikoOnPages } from "../kumiko";
import { setInferredEntriesStoryKinds } from "./story-kinds";
import { createAiStorySuggestions } from "./story-suggestions";

// The AI pipeline that used to run fire-and-forget inside getFullIndexation.
// It now runs in the worker process (see queue/ and worker.ts). Each stage
// persists to the DB and pushes progress to clients via `ctx.events`; `ctx.indexation`
// is refreshed as it goes.
export const runIndexationAi = async (ctx: IndexationAiContext) => {
  await runKumikoOnPages(ctx);
  await setInferredEntriesStoryKinds(ctx, ctx.indexation.entries);
  await createAiStorySuggestions(ctx);
};

export { setInferredEntriesStoryKinds } from "./story-kinds";
export { createAiStorySuggestions } from "./story-suggestions";
