import { issue } from "../api/dist/prisma/client_dm";
export type IssueWithPublicationcode = issue & { publicationcode: string };
