

import type { edge } from "~prisma-clients/schemas/dm";

import type { AugmentedIssue } from "./AugmentedIssue";
export type EdgeWithModelIdAndInducksData = AugmentedIssue<edge> &  { modelId?: number; v3: boolean };
