import edgeModelReady from "~/emails/edge-model-ready";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { RequiredAuthMiddleware } from "../auth/util";
import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import models from "./models";
import multipleEdgePhotos from "./multiple-edge-photos";
import { SessionUser } from "~dm-types/SessionUser";
import { useSocketServices } from "~socket.io-services";
import { UserSocket } from "~/index";

const listenEvents = (socket: UserSocket) => ({
  ...models(),
  ...edgeSprites(),
  ...edgePublication(),
  ...multipleEdgePhotos(socket),

  submitEdge: async (issuecode: string) => {
    const user = await prismaDm.user.findUniqueOrThrow({
      where: {
        id: socket.data.user!.id,
      },
    });

    const email = new edgeModelReady({
      user,
      issuecode,
    });
    await email.send();

    return { url: email.data.ecLink };
  },
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user: SessionUser }
>("/coa", {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
