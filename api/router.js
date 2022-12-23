import capcon from "capture-console";
import express from "express";
import { router } from "express-file-routing";

let output = "";
capcon.startCapture(process.stdout, (stdout) => {
  output += stdout;
});

const app = express();
app.use("/", router());

let routes = [];
app._router.stack.forEach(function (middleware) {
  if (middleware.route) {
    // routes registered directly on the app
    routes.push(middleware.route);
  } else if (middleware.name === "router") {
    // router middleware
    middleware.handle.stack.forEach(function (handler) {
      if (handler.route) {
        routes.push(handler.route);
      }
    });
  }
});

capcon.stopCapture(process.stdout);
console.log("!" + output + "!");

export default app;
