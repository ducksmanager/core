import fs from "fs";
import path from "path";

import { ExpressCall } from "~routes/_express-call";

const edgePath = `${process.env.PWD}/../${process.env.EDGES_PATH!}`;
const REGEX_IS_BROWSABLE_FILE = /^[-+(). _A-Za-z\d]+$/;
const REGEX_IS_SVG_FILE = /^_?.+\.svg$/;
export const get = async (
  ...[, res]: ExpressCall<{
    resBody: {
      current: string[];
      published: string[];
    };
  }>
) => {
  const findInDir = (dir: string) => {
    try {
      const files = fs.readdirSync(dir);
      const filteredFiles = files.filter((file) =>
        REGEX_IS_BROWSABLE_FILE.test(file)
      );
      for (const file of filteredFiles) {
        const filePath = path.join(dir, file);
        if (!file.includes(".")) {
          findInDir(filePath);
        } else if (REGEX_IS_SVG_FILE.test(file)) {
          const edgeStatus = file.indexOf("_") === 0 ? "current" : "published";
          fileList[edgeStatus].push(filePath.replace(/.+\/edges\//, ""));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fileList = {
    current: [] as string[],
    published: [] as string[],
  };
  findInDir(edgePath);
  return res.json(fileList);
};
