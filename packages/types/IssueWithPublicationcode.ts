import type { issue } from "~prisma-clients/schemas/dm";
export type IssueWithPublicationcode = issue & { publicationcode: string };
