import { createServer } from "http";
import { parse } from "url";
import * as Sentry from "@sentry/node";

import type { inducks_issue } from "~prisma-schemas/schemas/coa/client/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa";

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
      case "/status/db": {
        const dbStatus = await getDbStatus();
        if ('checkResults' in dbStatus) {
          Sentry.metrics.gauge("processlist", dbStatus.checkResults!.processList)
        }
        data = dbStatus;
        break;
      }
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
                    const issue: Pick<
                      inducks_issue,
                      "issuecode" | "title" | "oldestdate" | "pages" | "price"
                    > & { publishers?: string[] } =
                      await prismaCoa.inducks_issue.findFirstOrThrow({
                        select: {
                          issuecode: true,
                          title: true,
                          oldestdate: true,
                          pages: true,
                          price: true,
                        },
                        where: {
                          publicationcode,
                          issuenumber,
                        },
                      });
                    issue.publishers = (
                      await prismaCoa.inducks_publishingjob.findMany({
                        select: {
                          issuecode: true,
                          publisherid: true,
                        },
                        where: {
                          issuecode: issue.issuecode,
                        },
                      })
                    ).map((publishingjob) => publishingjob.publisherid);
                    const entriesList = await prismaCoa.inducks_entry.findMany({
                      select: {
                        entrycode: true,
                        storyversioncode: true,
                        title: true,
                      },
                      where: {
                        issuecode: issue.issuecode,
                      },
                    });
                    const storyversioncodes = entriesList
                      .map((entry) => entry.storyversioncode)
                      .filter(
                        (storyversioncode): storyversioncode is string =>
                          storyversioncode !== null,
                      );
                    const storyversions = (
                      await prismaCoa.inducks_storyversion.findMany({
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
                      })
                    ).groupBy("storyversioncode");
                    const storyversionjobs = (
                      await prismaCoa.inducks_storyjob.findMany({
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
                      })
                    ).groupBy(
                      "storyversioncode",
                      "[]",
                      ({ personcode, plotwritartink }) => ({
                        personcode,
                        plotwritartink,
                      }),
                    );

                    const storyversionAppearances = (
                      await prismaCoa.inducks_appearance.findMany({
                        select: {
                          storyversioncode: true,
                          charactercode: true,
                        },
                        where: {
                          storyversioncode: {
                            in: storyversioncodes,
                          },
                        },
                      })
                    ).groupBy("storyversioncode", "charactercode[]");

                    const entries = Object.fromEntries(
                      Object.entries(
                        entriesList.groupBy(
                          "entrycode",
                          null,
                          ({ title, storyversioncode }) => ({
                            storyversioncode,
                            title,
                            appearances:
                              (storyversioncode &&
                                storyversionAppearances[storyversioncode]) ||
                              [],
                            jobs:
                              (storyversioncode &&
                                storyversionjobs[storyversioncode]) ||
                              [],
                            storyversion:
                              (storyversioncode &&
                                storyversions[storyversioncode]) ||
                              null,
                          }),
                        ),
                      ).sort(([a], [b]) => a.localeCompare(b)),
                    );

                    data = {
                      issue,
                      entries,
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
            case "/comicrack/persons":
              data = (
                await prismaCoa.inducks_person.findMany({
                  select: {
                    personcode: true,
                    fullname: true,
                  },
                })
              ).groupBy("personcode", "fullname");
              break;
            case "/comicrack/characters":
              if (req.method === "GET") {
                const languagecode = url.query.languagecode as string;
                if (!languagecode) {
                  res.writeHead(400);
                  res.end();
                  return;
                }
                data = Object.fromEntries(
                  Object.entries(
                    (
                      await prismaCoa.inducks_charactername.findMany({
                        select: {
                          charactercode: true,
                          charactername: true,
                        },
                        where: {
                          languagecode,
                        },
                      })
                    ).groupBy("charactercode", "charactername[]"),
                  ).map(([key, values]) => [key, values[0]]),
                );
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

    res.writeHead("error" in data ? 500 : 200, {
      "Content-Type": "application/json",
    });
    res.write(JSON.stringify(data));
    res.end();
  });
