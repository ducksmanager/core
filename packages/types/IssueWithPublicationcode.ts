import { issue } from "~prisma-schemas/client_dm";
export type IssueWithPublicationcode = issue & { publicationcode: string };
