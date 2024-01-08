import { Namespace, Server } from "socket.io";

import { prismaDm } from "~/prisma";
import PresentationSentenceApproved from "~emails/presentation-sentence-approved";
import PresentationSentenceRefused from "~emails/presentation-sentence-refused";

import Services from "./types";

export default (io: Server) => {
  (io.of(Services.namespaceEndpoint) as Namespace<Services>).on(
    "connection",
    (socket) => {
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
        }
      );
    }
  );
};
