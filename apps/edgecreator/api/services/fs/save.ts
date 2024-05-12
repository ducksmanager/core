import fs from "fs";
import path from "path";
import sharp from "sharp";

import { getSvgPath } from "~/_utils";
import {
  PUT__edgecreator__publish__$country__$magazine__$issuenumber,
  PUT__edgecreator__submit,
} from "~dm_types/routes";
import { ExpressCall } from "~/services/_express-call";
import { ExportPaths } from "~types/ExportPaths";
import { ModelContributor } from "~types/ModelContributor";

import { call, createAxios } from "../../axios-helper";

const dmApi = createAxios(process.env.VITE_DM_API_URL!);
// const edgesPath = `${process.env.PWD}/../${process.env.EDGES_PATH!}`;

export const post = async (
  ...[req, res]: ExpressCall<{
    resBody: { paths: ExportPaths; isNew: boolean };
    reqBody: {
      runExport: boolean;
      runSubmit: boolean;
      country: string;
      magazine: string;
      issuenumber: string;
      contributors: ModelContributor[];
      content: string;
    };
  }>
) => {
  const {
    runExport,
    runSubmit,
    country,
    magazine,
    issuenumber,
    contributors,
    content,
  } = req.body;
  const svgPath = getSvgPath(runExport, country, magazine, issuenumber);

  const publicationcode = `${country}/${magazine}`;

  fs.mkdirSync(path.dirname(svgPath), { recursive: true });
  fs.writeFileSync(svgPath, content);
  let paths: ExportPaths = { svgPath };
  if (runExport) {
    const pngPath = svgPath.replace(".svg", ".png");
    try {
      await sharp(svgPath).png().toFile(pngPath);
    } catch (error: unknown) {
      res.writeHead(500);
      return res.end({ error });
    }

    paths = { ...paths, pngPath };

    const designers = contributors
      .filter(({ contributionType }) => contributionType === "createur")
      .map(({ user }) => user.username);

    const photographers = contributors
      .filter(({ contributionType }) => contributionType === "photographe")
      .map(({ user }) => user.username);

    try {
      const { isNew } = (
        await call(
          dmApi,
          new PUT__edgecreator__publish__$country__$magazine__$issuenumber({
            params: { country, magazine, issuenumber },
            reqBody: {
              designers,
              photographers,
            },
          }),
        )
      ).data;
      try {
        fs.unlinkSync(getSvgPath(false, country, magazine, issuenumber));
      } catch (error) {
        if ((error as { code?: string }).code === "ENOENT") {
          console.log("No temporary SVG file to delete was found");
        } else {
          res.writeHead(500);
          return res.end({ error });
        }
      }

      return res.json({ paths, isNew });
    } catch (e) {
      res.writeHead(500);
      return res.end({ error: e });
    }
  } else {
    if (runSubmit) {
      try {
        await call(
          dmApi,
          new PUT__edgecreator__submit({
            reqBody: {
              publicationcode,
              issuenumber,
            },
          }),
        );
      } catch (error) {
        res.writeHead(500);
        return res.end({ error });
      }
    }
    return res.json({ paths, isNew: false });
  }
};
