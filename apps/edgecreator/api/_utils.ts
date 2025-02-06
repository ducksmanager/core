import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { getEdgesPath } from ".";

export const getSvgPath = async (isExport: boolean, issuecode: string) => {
  const issue = await prismaCoa.inducks_issue.findFirstOrThrow({
    where: { issuecode },
    select: { publicationcode: true, issuenumber: true },
  });
  const [countrycode, magazinecode] = issue.publicationcode.split("/");
  return `${getEdgesPath()}/${countrycode}/gen/${
    isExport ? "" : "_"
  }${magazinecode}.${issue.issuenumber}.svg`;
};
