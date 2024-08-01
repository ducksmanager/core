import type { AugmentedIssue } from "AugmentedIssue";

import type { edge } from "~prisma-clients/schemas/dm";
export type EdgeWithModelIdAndInducksData = AugmentedIssue<edge> &  { modelId?: number; v3: boolean };
