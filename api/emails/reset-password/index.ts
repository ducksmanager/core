import { PrismaClient, user } from "~/dist/prisma/client_dm";
import { Email } from "~/emails";

const prisma = new PrismaClient();

class ResetPassword extends Email {
  data: { user: user; token: string };
  templatePath = __dirname;

  constructor(data: { user: user; token: string }) {
    super();
    this.data = data;
  }

  getFrom = () => process.env.SMTP_USERNAME!;
  getFromName = () => process.env.SMTP_FRIENDLYNAME!;
  getTo = () => this.data.user.email;
  getToName = () => this.data.user.username;
  getSubject = () =>
    i18n.__("Vous avez oublié votre mot de passe sur DucksManager ?");
  getTextBody = () => "";
}

prisma.user.findUniqueOrThrow({ where: { id: 999 } }).then(async (user) => {
  const email = new ResetPassword({ user, token: "abc" });
  console.log(await email.getHtmlBody());
});
