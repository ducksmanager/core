import { Email } from "~emails/email";
import { user } from "~prisma-schemas/client_dm";

export default class extends Email {
  data: {
    user: user | null;
  };
  templatePath = import.meta.dirname.includes("emails")
  ? import.meta.dirname
  : `/app/emails/bookstore-suggested`;

  constructor(data: { user: user | null }) {
    super();
    this.data = data;
  }

  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getFromName = () => this.data.user?.username || "Anonymous";
  getSubject = () => "Bookstore suggestion";
}
