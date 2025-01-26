import { Email, i18n } from "~emails/email";
import { user } from "~prisma-schemas/client_dm";

export default class extends Email {
  data: {
    user: user;
    locale: string;
    newMedalLevel: number | null;
  };
  templatePath = `/app/emails/bookstore-approved`;

  constructor(data: {
    user: user;
    locale: string;
    newMedalLevel: number | null;
  }) {
    super();
    this.data = data;
  }

  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () => i18n.__("Votre revue de bouquinerie a été approuvée !");
}
