import axios from "axios";
import { decode } from "node-base64-image";

import { ExpressCall } from "~routes/_express-call";
import { getNextAvailableFile } from "~routes/_upload_utils";
const edgesPath = process.env.EDGES_PATH;

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
  const { country, issuenumber, magazine, data } = req.body;
  const path = `${edgesPath}/${country}/photos`;
  const tentativeFileName = `${magazine}.${issuenumber}.photo`;
  const fileName = getNextAvailableFile(
    `${path}/${tentativeFileName}`,
    "jpg"
  ).match(/\/([^/]+)$/)![1];

  await decode(data, {
    fname: `${path}/${fileName.replace(/.jpg$/, "")}`,
    ext: "jpg",
  });

  try {
    const publicationcode = `${country}/${magazine}`;
    await axios.put(
      `${process.env.BACKEND_URL}/edgecreator/multiple_edge_photo/v2`,
      {
        publicationcode,
        issuenumber,
      },
      { headers: req.headers }
    );
  } catch (e) {
    res.writeHead(500);
    return res.end(e);
  }

  res.writeHead(200, {
    Connection: "close",
    "Content-Type": "application/text",
  });
  return res.json({ fileName });
};
