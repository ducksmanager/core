import { Server } from "socket.io";

import { prismaDm } from "~/prisma";
import { user } from "~prisma-clients/client_dm";

import { Namespace } from "./types";

export default (io: Server) => {
    (io.of(Namespace['endpoint']) as Namespace).on("connection", (socket) => {
        socket.on("getPublicCollection", async (username, callback) => {
            let user: user;
            try {
                user = await prismaDm.user.findFirstOrThrow({
                    where: { username },
                })
            }
            catch (e) {
                callback({ error: "User not found" });
                return;
            }
            if (!user.allowSharing) {
                callback({ error: "This user does not allow sharing" });
                return;
            }
            callback(
                await prismaDm.issue.findMany({
                    where: {
                        userId: user.id
                    },
                })
            );
        });
    })
};
