// noinspection ES6PreferShortImport
import { edge } from "~prisma-clients/client_dm";
export type EdgeWithModelId = edge & { modelId?: number; v3: boolean };
