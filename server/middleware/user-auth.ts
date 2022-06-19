import { H3Error } from "h3";
import jwt from "jsonwebtoken";

export default defineEventHandler((event) => {
  const authHeaderMatch = /authStateStorage=(?<token>.+?)(?:;|$)/.exec(
    event.req.headers.cookie
  );
  const token = JSON.parse(decodeURIComponent(authHeaderMatch?.groups.token))
    ?.user?.data?.token;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload && typeof payload === "object") {
        event.context.user = payload;
      } else {
        throw new H3Error("Payload is not an object");
      }
    } catch (e) {
      if (!(e instanceof jwt.JsonWebTokenError)) {
        throw e;
      }
      throw new H3Error("JWT is invalid");
    }
  }
});
