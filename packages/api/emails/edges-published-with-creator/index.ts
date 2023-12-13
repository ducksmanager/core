import { Email } from "~emails/email";
import { user } from "~prisma-clients/client_dm";

export default class extends Email {
  data: {
    user: user;
    locale: string;
    extraEdges: number;
    extraCreatorPoints: number;
    newMedalLevel: number | null;
  };
  templatePath = __dirname;

  constructor(data: {
    user: user;
    locale: string;
    extraEdges: number;
    extraCreatorPoints: number;
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
      ? Email.i18n.__(
          "Les tranches que vous avez aidé à créer ont été publiées sur DucksManager !"
        )
      : Email.i18n.__(
          "La tranche que vous avez aidé à créer a été publiée sur DucksManager !"
        );
}
