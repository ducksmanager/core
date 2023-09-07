import { Email, i18n } from "~emails/email";
import { user } from "~prisma-clients/client_dm";

type InputData = {
  user: user;
  publicationcode: string;
  issuenumber: string;
};
type Data = InputData & {
  ecLink: string;
  issuecode: string;
};
export default class extends Email {
  data: Data;
  templatePath = __dirname;

  constructor(data: InputData) {
    super();
    const issuecode = `${data.publicationcode} ${data.issuenumber}`;
    this.data = {
      ...data,
      ecLink: `${process.env.EDGECREATOR_ROOT}/edit/${issuecode}`,
      issuecode,
    };
  }

  getFrom = () => this.data.user.email!;
  getFromName = () => this.data.user.username;
  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getSubject = () =>
    i18n.__("User {{username}} sent a photo for edge {{issuecode}}", {
      username: this.data.user.username,
      issuecode: this.data.issuecode,
    });
}
