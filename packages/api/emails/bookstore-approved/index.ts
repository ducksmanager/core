import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-schemas/schemas/dm";

export default class extends Email {
  data: {
    user: user;
    locale: string;
    newMedalLevel: number | null;
  };
  templatePath = import.meta.dirname.includes("emails")
    ? import.meta.dirname
    : `/app/emails/bookstore-approved`;

  constructor(data: {
    user: user;
    locale: string;
    newMedalLevel: number | null;
  }) {
    super();
    this.data = data;
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () => i18n.__("Votre revue de bouquinerie a été approuvée !");
}
