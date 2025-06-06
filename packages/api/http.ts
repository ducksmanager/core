import { createServer } from "http";

import { getUpdateFileUrl } from "./services/app";

import {
  getDbStatus,
  getPastecSearchStatus,
  getPastecStatus,
} from "./services/status";

export default () => createServer(async (req, res) => {
    let data: { error: string } | object;
    switch (req.url) {
      case "/app/updates":
        data = getUpdateFileUrl();
        break;
      case "/status/db":
        data = await getDbStatus();
        break;
      case "/status/pastecsearch":
        data = await getPastecSearchStatus();
        break;
      case "/status/pastec":
        data = await getPastecStatus();
        break;
      default:
        res.writeHead(404);
        res.end();
        return;
    }
  
    res.writeHead("error" in data ? 500 : 200, { "Content-Type": "text/json" });
    res.write(JSON.stringify(data));
    res.end();
  });