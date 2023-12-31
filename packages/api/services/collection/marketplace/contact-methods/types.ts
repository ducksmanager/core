import { Errorable } from "../../../types";

export default interface ContactMethods {
  getContactMethods: (
    sellerId: number,
    callback: (
      data: Errorable<
        { discordId?: string; email?: string },
        "Invalid seller ID"
      >
    ) => void
  ) => void;
}
