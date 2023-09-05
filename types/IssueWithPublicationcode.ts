import { issue } from "../packages/api/dist/prisma/client_dm";
export type IssueWithPublicationcode = issue & { publicationcode: string };
