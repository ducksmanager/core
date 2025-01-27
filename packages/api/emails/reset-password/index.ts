import type { user } from "~prisma-schemas/schemas/dm";

import { Email, i18n } from "../email";

export default class extends Email {
  data: { user: user; token: string };
  templatePath = import.meta.dirname.includes('emails') ? import.meta.dirname:`${import.meta.dirname}/emails/reset-password`;

  sendCopyToAdmin = false;

  constructor(data: { user: user; token: string }) {
    super();
    this.data = data;
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () =>
    i18n.__("Vous avez oublié votre mot de passe sur DucksManager ?");
}
