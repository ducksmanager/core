import { createServer } from "http";
import { parse } from "url";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { getUpdateFileUrl } from "./services/app";
import {
  getDbStatus,
  getPastecSearchStatus,
  getPastecStatus,
} from "./services/status";

export default () =>
  createServer(async (req, res) => {
    let data: { error: string } | object;
    switch (req.url) {
      case "/app/updates":
        data = getUpdateFileUrl();
        break;
      case "/status/db":
        data = await getDbStatus();
        break;
      case "/status/pastecsearch":
        data = await getPastecSearchStatus();
        break;
      case "/status/pastec":
        data = await getPastecStatus();
        break;
      default:
        if (req.url?.startsWith("/comicrack/")) {
          const url = parse(req.url, true);
          switch (url.pathname) {
            case "/comicrack/issue":
              if (req.method === "GET") {
                if (url.query.publicationcode && url.query.issuenumber) {
                  const { publicationcode, issuenumber } = url.query as {
                    publicationcode: string;
                    issuenumber: string;
                  };
                  try {
                    const issue =
                      await prismaCoa.inducks_issue.findFirstOrThrow({
                        select: {
                          issuecode: true,
                          title: true,
                          oldestdate: true,
                          pages: true,
                        },
                        where: {
                          publicationcode,
                          issuenumber,
                        },
                      });
                    const entries = await prismaCoa.inducks_entry.findMany({
                      select: {
                        entrycode: true,
                        storyversioncode: true,
                        title: true,
                      },
                      where: {
                        issuecode: issue.issuecode,
                      },
                    });
                    const storyversioncodes = entries
                      .map((entry) => entry.storyversioncode)
                      .filter(
                        (
                          storyversioncode,
                        ): storyversioncode is string =>
                          storyversioncode !== null,
                      );
                    const storyversions =
                      (await prismaCoa.inducks_storyversion.findMany({
                        select: {
                          storyversioncode: true,
                          storycode: true,
                          kind: true,
                        },
                        where: {
                          storyversioncode: {
                            in: storyversioncodes,
                          },
                        },
                      })).groupBy('storyversioncode');
                      const storyversionjobs = (await prismaCoa.inducks_storyjob.findMany({
                        select: {
                          storyversioncode: true,
                          personcode: true,
                          plotwritartink: true,
                        },
                        where: {
                          storyversioncode: {
                            in: storyversioncodes,
                          },
                        },
                      })).groupBy('storyversioncode', '[]');
                    data = {
                      issue,
                      entries: entries.groupBy('entrycode', '[]', ({title, storyversioncode}) => ({
                        storyversioncode,
                        title,
                        jobs: storyversioncode && storyversionjobs[storyversioncode] || [],
                        storyversion: storyversioncode && storyversions[storyversioncode] || null,
                      })),
                    };
                  } catch (error) {
                    res.writeHead(404);
                    res.end(error);
                    return;
                  }
                } else {
                  res.writeHead(400);
                  res.end();
                  return;
                }
              } else {
                res.writeHead(405);
                res.end();
                return;
              }
              break;
            case "/comicrack/publications":
              data = (
                await prismaCoa.inducks_publication.findMany({
                  select: {
                    publicationcode: true,
                    title: true,
                  },
                })
              ).groupBy("publicationcode", "title");
              break;
            case "/comicrack/languages":
              data = (
                await prismaCoa.inducks_language.findMany({
                  select: {
                    languagecode: true,
                    languagename: true,
                  },
                })
              ).groupBy("languagecode", "languagename");
              break;
            case "/comicrack/characters":
              if (req.method === "GET") {
                const languagecode = url.query.languagecode as string;
                if (!languagecode) {
                  res.writeHead(400);
                  res.end();
                  return;
                }
                data = (
                  await prismaCoa.inducks_charactername.findMany({
                    select: {
                      charactercode: true,
                      charactername: true,
                    },
                    where: {
                      languagecode,
                    },
                  })
                ).groupBy("charactercode", "charactername");
              } else {
                res.writeHead(405);
                res.end();
                return;
              }
              break;
            default:
              res.writeHead(404);
              res.end();
              return;
          }
          break;
        } else {
          res.writeHead(404);
          res.end();
          return;
        }
    }

    res.writeHead("error" in data ? 500 : 200, { "Content-Type": "text/json" });
    res.write(JSON.stringify(data));
    res.end();
  });
