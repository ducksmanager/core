import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

export const getSvgPath = async (isExport: boolean, issuecode: string) => {
  const issue = await prismaCoa.inducks_issue.findFirstOrThrow({
    where: { issuecode },
    select: { publicationcode: true, issuenumber: true },
  });
  const [countrycode, magazinecode] = issue.publicationcode.split("/");
  return `${process.cwd()}/../${process.env.EDGES_PATH!}/${countrycode}/gen/${
    isExport ? "" : "_"
  }${magazinecode}.${issue.issuenumber}.svg`;
};
