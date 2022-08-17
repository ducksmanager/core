import { Express } from "express";

import { authenticateToken } from "../auth";
import subscription from "./subscription";

export default {
  addRoutes: (app: Express) => {
    app.all(/^\/api\/collection\/(.+)/, authenticateToken);
    subscription.addRoutes(app);
  },
};
