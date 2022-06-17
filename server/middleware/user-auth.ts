import jwt from "jsonwebtoken";

export default defineEventHandler((event) => {
  console.log(event.req.headers);
  const authHeaderMatch = /^authStateStorage=(?<token>.*?)[;$]/.exec(
    event.req.headers.cookie
  );
  const token = authHeaderMatch?.groups.token;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload && typeof payload === "object") {
        event.context.user = payload;
      } else {
        abortNavigation("403");
      }
    } catch (e) {
      if (!(e instanceof jwt.JsonWebTokenError)) {
        throw e;
      }
      abortNavigation("403");
    }
  }
});
