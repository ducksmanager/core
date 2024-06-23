import { issue } from "~prisma-clients/extended/dm.extends";
export type IssueWithPublicationcode = issue & { publicationcode: string };
