import { Email, i18n } from "~emails/email";
import type { user } from "~prisma-schemas/schemas/dm";

type InputData = {
  user: user;
};
type Data = InputData & {
  feedbackMessage: string;
};
export default class extends Email {
  data: Data;
  templatePath = `${import.meta.dirname}/emails/feedback-sent`;;

  constructor(data: Data) {
    super();
    this.data = data;
  }

  getTo = () => process.env.SMTP_USERNAME!;
  getToName = () => process.env.SMTP_FRIENDLYNAME!;
  getFrom = () => this.data.user?.email || "anonymous@duckmanager.net";
  getFromName = () => this.data.user?.username || "Anonymous";
  getSubject = () =>
    i18n.__("User {{username}} sent a feedback", {
      username: this.data.user.username,
    });
}
