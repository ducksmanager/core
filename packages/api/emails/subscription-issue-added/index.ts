import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-schemas/schemas/dm";

export default class extends Email {
  data: { user: user; publicationName: string; issuenumber: string };
  templatePath = `${import.meta.dirname}/emails/subscription-issue-added`;

  constructor(data: {
    user: user;
    publicationName: string;
    issuenumber: string;
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
      "{{publicationName}} {{issuenumber}} a été ajouté à votre collection !",
      {
        publicationName: this.data.publicationName,
        issuenumber: this.data.issuenumber,
      },
    );
}
