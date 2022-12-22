import { Send } from "express-serve-static-core";
import { ServerResponse } from "http";

export interface TypedResponse<ResBody> extends ServerResponse {
  json: Send<ResBody, this>;
}
