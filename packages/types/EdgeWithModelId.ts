// noinspection ES6PreferShortImport
import { edge } from "~prisma-schemas/client_dm";
export type EdgeWithModelId = edge & { modelId?: number; v3: boolean };
