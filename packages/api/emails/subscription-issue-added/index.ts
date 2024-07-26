import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-clients/extended/dm.extends";

export default class extends Email {
  data: { user: user; publicationName: string; shortIssuenumber: string };
  templatePath = __dirname;

  constructor(data: {
    user: user;
    publicationName: string;
    shortIssuenumber: string;
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
      "{{publicationName}} {{shortIssuenumber}} a été ajouté à votre collection !",
      {
        publicationName: this.data.publicationName,
        shortIssuenumber: this.data.shortIssuenumber,
      },
    );
}
