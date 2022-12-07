import PushNotifications from "@pusher/push-notifications-server";
import { Handler } from "express";

export const get: Handler = (req, res) => {
  if (req.query.user_id !== req.user.username) {
    res.writeHead(401, { "Content-Type": "application/text" });
    res.end();
  } else {
    try {
      return res.json(
        new PushNotifications({
          instanceId: process.env.PUSHER_INSTANCE_ID || "",
          secretKey: process.env.PUSHER_SECRET_KEY || "",
        }).generateToken(req.user.username)
      );
    } catch (e) {
      console.error(e);
      res.writeHead(500);
      res.end();
    }
  }
};
