import axios from "axios";
import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_cover_info";
import { ExpressCall } from "~routes/_express-call";
import {
  CoverSearchResults,
  SimilarImagesResult,
} from "~types/CoverSearchResults";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      reqBody: { base64: string };
      resBody: CoverSearchResults;
    }>
  ) => {
    console.log("Cover ID search: upload file validation done");

    const pastecResponse: SimilarImagesResult | null = await getSimilarImages(
      Buffer.from(req.body.base64, "base64")
    );
    console.log("Cover ID search: processing done");

    if (!pastecResponse) {
      res.writeHead(500, { "Content-Type": "application/text" });
      res.end("Pastec returned NULL");
      return;
    }
    if (!pastecResponse?.imageIds?.length) {
      console.log(`Pastec returned ${JSON.stringify(pastecResponse)}`);
      return res.json({
        issues: [],
        imageIds: [],
        type: pastecResponse.type,
      });
    }
    console.log("Cover ID search: matched cover IDs $coverIds");
    console.log(
      `Cover ID search: scores=${JSON.stringify(pastecResponse.scores)}`
    );

    const coverInfos = (
      await getIssuesCodesFromCoverIds(pastecResponse.imageIds)
    ).sort((cover1, cover2) =>
      Math.sign(
        pastecResponse.imageIds.indexOf(cover1.id) -
          pastecResponse.imageIds.indexOf(cover2.id)
      )
    );
    const foundIssueCodes = [
      ...new Set(coverInfos.map(({ issuecode }) => issuecode)),
    ];
    console.log(
      `Cover ID search: matched issue codes ${foundIssueCodes.join(",")}`
    );

    const issues = getIssuesFromIssueCodes(foundIssueCodes);
    console.log(`Cover ID search: matched ${coverInfos.length} issues`);

    // TODO sort

    return res.json({
      issues: Object.values(issues),
      imageIds: pastecResponse.imageIds,
    });
  },
];

const getIssuesFromIssueCodes = (foundIssueCodes: string[]) => {
  // TODO
  return foundIssueCodes;
};

const getIssuesCodesFromCoverIds = async (coverIds: number[]) =>
  await prisma.cover.findMany({
    where: {
      id: {
        in: coverIds,
      },
    },
  });

const getSimilarImages = async (
  cover: Buffer
): Promise<SimilarImagesResult | null> =>
  axios
    .post(
      `http://${process.env.PASTEC_HOSTS!}:${
        process.env.PASTEC_PORT
      }/index/searcher`,
      {
        wtd_jpg: cover,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then(({ data }) => data)
    .catch((e) => {
      console.error(e);
    });
