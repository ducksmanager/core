import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-clients/extended/dm.extends";

type InputData = {
  user: user;
  shortIssuecode: string;
};
type Data = InputData & {
  ecLink: string;
};
export default class extends Email {
  data: Data;
  templatePath = __dirname;

  constructor(data: InputData) {
    super();
    this.data = {
      ...data,
      ecLink: `${process.env.EDGECREATOR_ROOT}/edit/${data.shortIssuecode}`,
    };
  }

  getFrom = () => this.data.user.email!;
  getFromName = () => this.data.user.username;
  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getSubject = () =>
    i18n.__("User {{username}} sent a photo for edge {{shortIssuecode}}", {
      username: this.data.user.username,
      shortIssuecode: this.data.shortIssuecode,
    });
}
