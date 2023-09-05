// noinspection ES6PreferShortImport
import { edge } from "../packages/api/dist/prisma/client_dm";
export type EdgeWithModelId = edge & { modelId?: number; v3: boolean };
