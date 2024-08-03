import type { issue } from "~prisma-schemas/schemas/dm";
export type IssueWithPublicationcode = issue & { publicationcode: string };
