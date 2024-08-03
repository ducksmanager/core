import type { Namespace, Server } from "socket.io";

import PresentationSentenceApproved from "~emails/presentation-sentence-approved";
import PresentationSentenceRefused from "~emails/presentation-sentence-refused";
import { prismaClient as prismaDm } from "~prisma-clients/schemas/dm/client";

import type Events from "./types";
import { namespaceEndpoint } from "./types";

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to presentation-text");

    socket.on(
      "approveOrDenyPresentationText",
      async (sentence, userId, decision, callback) => {
        switch (decision) {
          case "approve":
            const user = await prismaDm.user.update({
              data: {
                presentationText: sentence,
              },
              where: {
                id: userId,
              },
            });
            await new PresentationSentenceApproved({ user }).send();
            break;
          case "refuse":
            await new PresentationSentenceRefused({
              user: await prismaDm.user.findUniqueOrThrow({
                where: { id: userId },
              }),
            }).send();
        }

        callback();
      },
    );
  });
};
