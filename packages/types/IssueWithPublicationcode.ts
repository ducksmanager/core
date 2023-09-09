import { issue } from "~prisma-clients/client_dm";
export type IssueWithPublicationcode = issue & { publicationcode: string };
