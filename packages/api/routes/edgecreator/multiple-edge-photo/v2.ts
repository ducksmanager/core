import bodyParser from "body-parser";
import { prismaDm } from "~/prisma";

import EdgePhotoSent from "~emails/edge-photo-sent";
import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();
export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: {
        edgeModel: { url: string };
      };
      reqBody: {
        publicationcode: string;
        issuenumber: string;
      };
    }>
  ) => {
    const user = await prismaDm.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    const { publicationcode, issuenumber } = req.body;
    const email = new EdgePhotoSent({
      user,
      publicationcode,
      issuenumber,
    });
    const edgeUrl = email.data.ecLink;
    await email.send();

    return res.json({ edgeModel: { url: edgeUrl } });
  },
];
