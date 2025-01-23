import { decode } from "node-base64-image";

import { PUT__edgecreator__multiple_edge_photo__v2 } from "~api-routes";
import { ExpressCall } from "~routes/_express-call";
import { getNextAvailableFile } from "~routes/_upload_utils";

import { call, createAxios } from "../../axios-helper";
const edgesPath: string = process.env.EDGES_PATH!;

const dmApi = createAxios(process.env.DM_API_URL!);
export const post = async (
  ...[req, res]: ExpressCall<{
    resBody: { fileName: string };
    reqBody: {
      data: string;
      country: string;
      magazine: string;
      issuenumber: string;
    };
  }>
) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', async () => {
    const { country, issuenumber, magazine, data } = JSON.parse(body) as typeof req.body;
    const path = `${edgesPath}/${country}/photos`;
    const tentativeFileName = `${magazine}.${issuenumber}.photo`;
    const fileName = getNextAvailableFile(
      `${path}/${tentativeFileName}`,
      "jpg",
    ).match(/\/([^/]+)$/)![1];

    await decode(data, {
      fname: `${path}/${fileName.replace(/.jpg$/, "")}`,
      ext: "jpg",
    });

    try {
      const publicationcode = `${country}/${magazine}`;

      await call(
        dmApi,
        new PUT__edgecreator__multiple_edge_photo__v2({
          reqBody: {
            publicationcode,
            issuenumber,
          },
        }),
      );
    } catch (e) {
      res.writeHead(500);
      return res.end(JSON.stringify(e));
    }

    res.writeHead(200, {
      Connection: "close",
      "Content-Type": "application/text",
    });
    return res.json({ fileName });
  });

};
