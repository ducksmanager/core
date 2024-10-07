import { prismaDm } from "~/prisma";
import { issue, user } from "~prisma-schemas/client_dm";
import { ExpressCall } from "~routes/_express-call";

export const get = async (...[req, res]: ExpressCall<{ params: { username: string }, resBody: issue[] }>) => {
    let user: user;
    try {
        user = await prismaDm.user.findFirstOrThrow({
            where: { username: req.params.username }
        })
    }
    catch (e) {
        res.statusCode = 404;
        res.end();
        return;
    }
    if (!user.allowSharing) {
        res.statusCode = 403;
        res.end();
        return;
    }
    return res.json(
        await prismaDm.issue.findMany({
            where: {
                userId: user.id
            },
        })
    );
};
