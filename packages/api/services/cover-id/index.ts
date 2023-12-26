import axios from "axios";
import https from "https";
import { Server } from "socket.io";

import { prismaCoa, prismaCoverInfo } from "~/prisma";
import {
  SimilarImagesResult,
} from "~dm-types/CoverSearchResults";

import { Namespace } from "./types";

export default (io: Server) => {
  (io.of(Namespace['endpoint']) as Namespace).on("connection", (socket) => {
    socket.on("searchFromCover", async (base64, callback) => {
      const buffer = Buffer.from(base64, "base64");
      const pastecResponse: SimilarImagesResult | null = await getSimilarImages(
        buffer
      );

      console.log("Cover ID search: processing done");

      if (!pastecResponse) {
        callback({ error: "Pastec returned NULL" });
        return;
      }
      if (!pastecResponse?.image_ids?.length) {
        callback({ error: 'Pastec returned en error', errorDetails: JSON.stringify(pastecResponse) });
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

      callback({
        covers: coverInfos.map((cover) => ({
          ...cover,
          ...issues.find(({ issuecode }) => cover.issuecode === issuecode)!,
        })),
      });
    });

    socket.on('downloadCover', async (coverId, callback) => {
      const cover = await prismaCoverInfo.cover.findUniqueOrThrow({
        where: {
          id: coverId,
        },
      });
      const remotePath = `${cover.sitecode}/${cover.sitecode === "webusers" ? "webusers" : ""
        }${cover.url}`;

      const data: Uint8Array[] = [];
      const externalRequest = https.request(
        {
          hostname: process.env.INDUCKS_COVERS_ROOT,
          path: remotePath,
        },
        (res) => {
          res.on('data', function (chunk) {
            data.push(chunk);
          }).on('end', function () {
            //at this point data is an array of Buffers
            //so Buffer.concat() can make us a new Buffer
            //of all of them together
            const buffer = Buffer.concat(data);
            callback(buffer.toString('base64'))
          });
        }
      );
      externalRequest.on("error", function (err) {
        console.error(err);
        callback({ error: 'Error', errorDetails: err.message })
      });
      externalRequest.end();
    })
  },
  );
};

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
      `http://${process.env.PASTEC_HOSTS!}:${process.env.PASTEC_PORT
      }/index/searcher`,
      cover
    )
    .then(({ data }) => data)
    .catch((e) => {
      console.error(e);
    });

