import axios from "axios";
import https from "https";

import type { SimilarImagesResult } from "~dm-types/CoverSearchResults";
import { prismaClient as prismaCoverInfo } from "~prisma-schemas/schemas/cover_info/client";
import type { EitherOr } from "~socket.io-services";
import { useSocketServices } from "~socket.io-services";

import { getCoverUrls } from "../coa/issue-details";
import namespaces from "../namespaces";

const listenEvents = () => ({
  searchFromCover: async ({
    url,
    base64,
  }: EitherOr<{ base64?: string }, { url?: string }>) => {
    const buffer = url
      ? (
          await axios.get(url, {
            responseType: "arraybuffer",
          })
        ).data
      : Buffer.from(base64!.split(";base64,").pop()!, "base64");

    const pastecResponse: SimilarImagesResult | null =
      await getSimilarImages(buffer);

    console.log("Cover ID search: processing done");

    if (!pastecResponse) {
      return { error: "Pastec returned NULL" };
    }
    if (!pastecResponse?.image_ids) {
      return {
        error: "Pastec returned en error",
        errorDetails: JSON.stringify(pastecResponse),
      };
    }
    console.log(
      `Cover ID search: matched cover IDs ${pastecResponse?.image_ids}`,
    );
    console.log(
      `Cover ID search: scores=${JSON.stringify(pastecResponse.scores)}`,
    );

    const coversByIssuecode = await getIssuesCodesFromCoverIds(
      pastecResponse.image_ids,
    )
      .then(async (covers) => {
        const coverIdByIssuecode = covers.groupBy("issuecode", "id");
        return getCoverUrls(Object.keys(coverIdByIssuecode)).then((coverUrls) =>
          coverUrls.map(({ issuecode, fullUrl }) => ({
            issuecode,
            fullUrl,
            id: coverIdByIssuecode[issuecode],
          })),
        );
      })
      .then((covers) =>
        covers.sort((cover1, cover2) =>
          Math.sign(
            pastecResponse.image_ids.indexOf(cover1.id) -
              pastecResponse.image_ids.indexOf(cover2.id),
          ),
        ),
      );

    const issuecodes = Object.keys(coversByIssuecode);
    console.log(`Cover ID search: matched issue codes ${issuecodes.join(",")}`);

    return {
      covers: coversByIssuecode.map(({ issuecode, fullUrl }) => ({
        issuecode,
        fullUrl,
      })),
    };
  },
  getCoverUrl: async (coverId: number) =>
    getCoverUrl(coverId).then(
      (url) => `${process.env.INDUCKS_COVERS_ROOT}/${url}`,
    ),

  downloadCover: (coverId: number) =>
    new Promise(async (resolve) => {
      const coverUrl = await getCoverUrl(coverId);

      const data: Uint8Array[] = [];
      const externalRequest = https.request(
        {
          hostname: process.env.INDUCKS_COVERS_ROOT,
          path: coverUrl,
        },
        (res) => {
          res
            .on("data", function (chunk) {
              data.push(chunk);
            })
            .on("end", function () {
              //at this point data is an array of Buffers so Buffer.concat() can make us a new Buffer of all of them together
              resolve({ buffer: Buffer.concat(data) });
            });
        },
      );
      externalRequest.on("error", function (err) {
        console.error(err);
        resolve({ error: "Error", errorDetails: err.message });
      });
      externalRequest.end();
    }),
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents
>(namespaces.COVER_ID, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];

const getIssuesCodesFromCoverIds = async (coverIds: number[]) =>
  await prismaCoverInfo.cover.findMany({
    where: {
      id: {
        in: coverIds,
      },
    },
  });

const getCoverUrl = async (coverId: number) =>
  prismaCoverInfo.cover
    .findUniqueOrThrow({
      where: {
        id: coverId,
      },
    })
    .then(
      (cover) =>
        `${cover.sitecode}/${
          cover.sitecode === "webusers" ? "webusers" : ""
        }${cover.url}`,
    );

const getSimilarImages = async (
  cover: Buffer,
): Promise<SimilarImagesResult | null> =>
  axios
    .post(
      `http://${process.env.PASTEC_HOSTS!}:${
        process.env.PASTEC_PORT
      }/index/searcher`,
      cover,
      {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      },
    )
    .then(({ data }) => data)
    .catch((e) => {
      console.error(e);
    });
