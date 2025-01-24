import { Email, i18n } from "~emails/email";
import { user } from "~prisma-schemas/client_dm";

export default class extends Email {
  data: {
    user: user;
    presentationText: string;
  };
  templatePath = `${import.meta.dirname}/emails/presentation-sentence-requested`;

  constructor(data: { user: user; presentationText: string }) {
    super();
    this.data = data;
  }

  getFromName = () => this.data.user.username!;
  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getSubject = () => i18n.__("Presentation sentence update request");
}
