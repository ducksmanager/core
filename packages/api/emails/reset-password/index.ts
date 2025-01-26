import { Email, i18n } from "~emails/email";
import { user } from "~prisma-schemas/client_dm";

export default class extends Email {
  data: { user: user; token: string };
  templatePath = `/app/emails/reset-password`;

  sendCopyToAdmin = false;

  constructor(data: { user: user; token: string }) {
    super();
    this.data = data;
  }

  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () =>
    i18n.__("Vous avez oublié votre mot de passe sur DucksManager ?");
}
