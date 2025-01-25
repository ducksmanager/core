import type { user } from "~prisma-schemas/schemas/dm";

import { Email, i18n } from "../email";

type InputData = {
  user: user;
  issuecode: string;
};
type Data = InputData & {
  ecLink: string;
  issuecode: string;
};
export default class extends Email {
  data: Data;
  templatePath = `${import.meta.dirname}/emails/edge-photo-sent`;

  constructor(data: InputData) {
    super();
    this.data = {
      ...data,
      ecLink: `${process.env.EDGECREATOR_ROOT}/edit/${data.issuecode}`,
    };
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => this.data.user.username;
  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getSubject = () =>
    i18n.__("User {{username}} sent a photo for edge {{issuecode}}", {
      username: this.data.user.username,
      issuecode: this.data.issuecode,
    });
}
