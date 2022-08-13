import express from "express";
import { call } from "./call-api";
import { AxiosError } from "axios";

import cors from "cors";
import { getEvents } from "./services/events";
import { getUsersPoints, getUsersQuickStats } from "./services/global-stats";

const app = express();
app.use(cors({
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

const port = 3000;

app.all(/^\/api\/coa\/(.+)/, async (req, res) => {
  const path = req.params[0];
  try {
    const response = await call(`/coa/${path}`, "coa", req.body, req.method);
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(response.data))
  } catch (e: any) {
    const error = e as AxiosError
    res.statusCode = error.response?.status || 500
    console.error(error.message)
    res.end();
  }
});

app.get('/events', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  let events = await getEvents();
  res.end(JSON.stringify(events))
})

app.get(/^\/global-stats\/user\/(.+)/, async (req, res) => {
  const userIds = req.params[0].split(',').map(userId => parseInt(userId));
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    points: await getUsersPoints(userIds),
    stats: await getUsersQuickStats(userIds)
  }))
})

app.listen(port, () => {
  console.log(`Gateway listening on port ${port}`);
});
