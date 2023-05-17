import * as fs from "fs";
import https from "https";

import { PrismaClient } from "~prisma_clients/client_cover_info";
import { ExpressCall } from "~routes/_express-call";
import {
  CoverSearchResults,
  SimilarImagesResult,
} from "~types/CoverSearchResults";

const prisma = new PrismaClient();

const streamToString = (stream: any): Promise<string> => {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: string) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err: string) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

export const put = (
  ...[req, res]: ExpressCall<{ resBody: CoverSearchResults }>
) => {
  req.busboy?.on("file", async (name: string, file) => {
    if (name !== "wtd_jpg") {
      res.writeHead(400);
      res.end();
    } else {
      console.log("Cover ID search: upload file validation done");
      const targetFileName = `${String(Math.random()).replace(/^0./, "")}.jpg`;
      fs.writeFileSync(targetFileName, await streamToString(file));
      console.log("Cover ID search: upload file moving done");

      const fileObject = fs.readFileSync(targetFileName);
      const pastecResponse: SimilarImagesResult | null =
        getSimilarImages(fileObject);
      fs.unlinkSync(targetFileName);
      console.log("Cover ID search: processing done");

      if (!pastecResponse) {
        res.writeHead(500, { "Content-Type": "application/text" });
        res.end("Pastec returned NULL");
        return;
      }
      if (!pastecResponse.imageIds.length) {
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
    }
  });
};

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

const getSimilarImages = (file: Buffer): SimilarImagesResult | null => {
  const pastecRequest = https.request(
    {
      hostname: process.env.PASTEC_HOSTS!.split(",")[0],
      port: process.env.PASTEC_PORT,
      path: "index/searcher",
      method: "POST",
    },
    (res) => {
      res.on("data", (data) => {
        console.log(`Received response from Pastec: ${data}`);
      });
      res.on("error", (error) => {
        console.error(`Error from Pastec: ${error}`);
      });
    }
  );
  pastecRequest.write(file);
  pastecRequest.end();

  // TODO
  return null;
};
