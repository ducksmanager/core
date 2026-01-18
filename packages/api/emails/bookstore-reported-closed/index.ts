import { Email } from "../email";

export default class extends Email {
  data: {
    username: string;
  };
  templatePath = import.meta.dirname.includes("emails")
    ? import.meta.dirname
    : `/app/emails/bookstore-reported-closed`;

  constructor(data: { username: string, bookstoreId: number, bookstoreName: string }) {
    super();
    this.data = data;
  }

  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => this.data.username || "Anonymous";
  getSubject = () => "Bookstore reported as closed";
}
