import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-clients/schemas/dm";

export default class extends Email {
  data: {
    user: user;
  };
  templatePath = __dirname;

  constructor(data: { user: user }) {
    super();
    this.data = data;
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () => i18n.__("Votre phrase de présentation a été acceptée !");
}
