import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-schemas/schemas/dm";

export default class extends Email {
  data: {
    user: user;
  };
  templatePath = import.meta.dirname.includes('emails') ? import.meta.dirname:`${import.meta.dirname}/emails/presentation-sentence-approved`;

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
