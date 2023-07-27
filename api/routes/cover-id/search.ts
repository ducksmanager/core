import axios from "axios";
import bodyParser from "body-parser";

import { prismaCoa, prismaCoverInfo } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";
import {
  CoverSearchResults,
  SimilarImagesResult,
} from "~types/CoverSearchResults";

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

    const buffer = Buffer.from(req.body.base64, "base64");
    const pastecResponse: SimilarImagesResult | null = await getSimilarImages(
      buffer
    );

    console.log("Cover ID search: processing done");

    if (!pastecResponse) {
      res.writeHead(500, { "Content-Type": "application/text" });
      res.end("Pastec returned NULL");
      return;
    }
    if (!pastecResponse?.image_ids?.length) {
      console.log(`Pastec returned ${JSON.stringify(pastecResponse)}`);
      return res.json({
        covers: [],
        type: pastecResponse.type,
      });
    }
    console.log(
      `Cover ID search: matched cover IDs ${pastecResponse?.image_ids}`
    );
    console.log(
      `Cover ID search: scores=${JSON.stringify(pastecResponse.scores)}`
    );

    const coverInfos = (
      await getIssuesCodesFromCoverIds(pastecResponse.image_ids)
    ).sort((cover1, cover2) =>
      Math.sign(
        pastecResponse.image_ids.indexOf(cover1.id) -
          pastecResponse.image_ids.indexOf(cover2.id)
      )
    );
    const foundIssueCodes = [
      ...new Set(coverInfos.map(({ issuecode }) => issuecode)),
    ];
    console.log(
      `Cover ID search: matched issue codes ${foundIssueCodes.join(",")}`
    );

    const issues = await getIssuesFromIssueCodes(foundIssueCodes);
    console.log(`Cover ID search: matched ${coverInfos.length} issues`);

    // TODO sort

    return res.json({
      covers: coverInfos.map((cover) => ({
        ...cover,
        ...issues.find(({ issuecode }) => cover.issuecode === issuecode)!,
      })),
    });
  },
];

const getIssuesFromIssueCodes = async (foundIssueCodes: string[]) =>
  await prismaCoa.inducks_issue.findMany({
    select: {
      issuecode: true,
      publicationcode: true,
      issuenumber: true,
    },
    where: {
      issuecode: {
        in: foundIssueCodes,
      },
    },
  });

const getIssuesCodesFromCoverIds = async (coverIds: number[]) =>
  await prismaCoverInfo.cover.findMany({
    where: {
      sitecode: "webusers",
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
      cover
    )
    .then(({ data }) => data)
    .catch((e) => {
      console.error(e);
    });
