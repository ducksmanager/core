// noinspection ES6PreferShortImport
import { edge } from "~prisma-clients/extended/dm.extends";
export type EdgeWithModelId = edge & { modelId?: number; v3: boolean };
