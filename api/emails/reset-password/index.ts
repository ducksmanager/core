import { Email, i18n } from "~/emails";
import { user } from "~prisma_clients/client_dm";

export default class extends Email {
  data: { user: user; token: string };
  templatePath = __dirname;

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
  getTextBody = () => "";
}
