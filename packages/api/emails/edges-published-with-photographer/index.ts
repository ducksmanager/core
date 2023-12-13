import { Email } from "~emails/email";
import { user } from "~prisma-clients/client_dm";

export default class extends Email {
  data: {
    user: user;
    locale: string;
    extraEdges: number;
    extraPhotographerPoints: number;
    newMedalLevel: number | null;
  };
  templatePath = __dirname;

  constructor(data: {
    user: user;
    locale: string;
    extraEdges: number;
    extraPhotographerPoints: number;
    newMedalLevel: number | null;
  }) {
    super();
    this.data = data;
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () =>
    this.data.extraEdges > 1
      ? Email.i18n.__("Vos tranches ont été publiées sur DucksManager !")
      : Email.i18n.__("Votre tranche a été publiée sur DucksManager !");
}
