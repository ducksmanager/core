import { Email } from "~emails/email";
import { user } from "~prisma-clients/client_dm";

export default class extends Email {
  data: {
    user: user;
    presentationText: string;
  };
  templatePath = __dirname;

  constructor(data: { user: user; presentationText: string }) {
    super();
    this.data = data;
  }

  getFrom = () => this.data.user.email!;
  getFromName = () => this.data.user.username!;
  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getSubject = () => Email.i18n.__("Presentation sentence update request");
}
