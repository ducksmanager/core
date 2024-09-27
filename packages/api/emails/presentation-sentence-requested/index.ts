import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-schemas/schemas/dm";

export default class extends Email {
  data: {
    user: user;
    presentationText: string;
  };
  templatePath = import.meta.dir;

  constructor(data: { user: user; presentationText: string }) {
    super();
    this.data = data;
  }

  getFrom = () => this.data.user.email!;
  getFromName = () => this.data.user.username!;
  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getSubject = () => i18n.__("Presentation sentence update request");
}
