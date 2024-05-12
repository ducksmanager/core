import fs from "fs";
import path from "path";

import { ExpressCall } from "~/services/_express-call";

const edgesPath = `${process.env.PWD!}/../${process.env.EDGES_PATH!}`;
const REGEX_IS_BROWSABLE_FILE = /^[-+(). _A-Za-z\d]+$/;
const REGEX_IS_SVG_FILE = /^_?.+\.svg$/;
export const get = (
  ...[, res]: ExpressCall<{
    resBody: {
      current: { filename: string; mtime: string }[];
      published: { filename: string; mtime: string }[];
    };
  }>
) => {
  const findInDir = (dir: string) => {
    try {
      const files = fs.readdirSync(dir);
      const filteredFiles = files.filter((file) =>
        REGEX_IS_BROWSABLE_FILE.test(file),
      );
      for (const file of filteredFiles) {
        const filePath = path.join(dir, file);
        if (!file.includes(".")) {
          findInDir(filePath);
        } else if (REGEX_IS_SVG_FILE.test(file)) {
          const edgeStatus = file.startsWith("_") ? "current" : "published";
          fileList[edgeStatus].push({
            filename: filePath.replace(/.+\/edges\//, ""),
            mtime: fs.statSync(filePath).mtime.toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fileList = {
    current: [] as { filename: string; mtime: string }[],
    published: [] as { filename: string; mtime: string }[],
  };
  findInDir(edgesPath);
  return res.json(fileList);
};
