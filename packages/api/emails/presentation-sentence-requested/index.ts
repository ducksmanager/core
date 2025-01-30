import type { user } from "~prisma-schemas/schemas/dm";

import { Email, i18n } from "../email";

export default class extends Email {
  data: {
    user: user;
    presentationText: string;
  };
  templatePath = import.meta.dirname.includes("emails")
    ? import.meta.dirname
    : `${import.meta.dirname}/emails/presentation-sentence-requested`;

  constructor(data: { user: user; presentationText: string }) {
    super();
    this.data = data;
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => this.data.user.username!;
  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getSubject = () => i18n.__("Presentation sentence update request");
}
