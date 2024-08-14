import type {
  inducks_entry,
  inducks_storyversion,
} from "~prisma-schemas/schemas/coa";

import type { AllNonNullable } from "./AllNonNullable";

export type EntryPartInfo = AllNonNullable<
  Pick<inducks_entry, "part"> &
    Pick<inducks_storyversion, "estimatedpanels"> & {
      total_estimatedpanels: inducks_storyversion["estimatedpanels"];
    }
>;
