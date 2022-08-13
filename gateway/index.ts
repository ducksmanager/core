import { AxiosError } from "axios";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { call } from "./call-api";
import auth from "./services/auth";
import { getEvents } from "./services/events";
import { getUsersPoints, getUsersQuickStats } from "./services/global-stats";

const port = 3000;

const app = express();
app.use(
  cors({
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(cookieParser());

auth.addRoutes(app);

app.all(/^\/api\/coa\/(.+)/, async (req, res) => {
  const path = req.params[0];
  try {
    const response = await call(`/coa/${path}`, "coa", req.body, req.method);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response.data));
  } catch (e: any) {
    const error = e as AxiosError;
    res.statusCode = error.response?.status || 500;
    console.error(error.message);
    res.end();
  }
});

app.get("/events", async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  const events = await getEvents();
  res.end(JSON.stringify(events));
});

app.get(/^\/global-stats\/user\/(.+)/, async (req, res) => {
  const userIds = req.params[0]
    .split(",")
    .map((userId) => parseInt(userId))
    .filter((userId) => !isNaN(userId));
  let data = {};
  if (userIds.length) {
    data = {
      points: await getUsersPoints(userIds),
      stats: await getUsersQuickStats(userIds),
    };
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
});

app.listen(port, () => {
  console.log(`Gateway listening on port ${port}`);
});
