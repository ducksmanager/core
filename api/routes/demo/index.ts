import { prismaDm } from "~/prisma";
import { getHashedPassword } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";
import { loginAs } from "~routes/auth/util";

export const post = async (
  ...[, res]: ExpressCall<{ resBody: { token: string } }>
) => {
  const demoUser = await prismaDm.user.findFirst({
    where: { username: "demo" },
  });
  if (!demoUser) {
    res.writeHead(500);
    res.end();
  } else {
    const token = await loginAs(
      demoUser,
      getHashedPassword(demoUser!.password)
    );

    return res.json({ token });
  }
};
