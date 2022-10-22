import { user } from "~/dist/prisma/client_dm";
import { Email, i18n } from "~/emails";

export default class extends Email {
  data: { user: user; publicationName: string; issueNumber: string };
  templatePath = __dirname;

  constructor(data: {
    user: user;
    publicationName: string;
    issueNumber: string;
  }) {
    super();
    this.data = data;
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () =>
    i18n.__(
      "{{publicationName}} {{issueNumber}} a été ajouté à votre collection !",
      {
        publicationName: this.data.publicationName,
        issueNumber: this.data.issueNumber,
      }
    );
  getTextBody = () => "";
}
