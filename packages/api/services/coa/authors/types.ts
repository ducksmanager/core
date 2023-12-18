import { inducks_issue } from "~prisma-clients/client_coa";

export default interface Authors {
  getAuthorList: (
    personcodes: string[],
    callback: (value: { [_personcode: string]: string }) => void,
  ) => void;
  searchAuthor: (
    partialAuthorName: string,
    callback: (value: Record<string, inducks_issue>) => void,
  ) => void;
}
