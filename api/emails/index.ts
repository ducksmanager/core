import * as ejs from "ejs";
import { I18n } from "i18n";
import { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import path from "path";

export const i18n = new I18n({
  locales: ["fr", "en"],

  defaultLocale: "en",
  staticCatalog: {
    en: require(path.join(
      __dirname,
      "..",
      "..",
      "src",
      "translations",
      "messages.en.json"
    )),
  },
});

export abstract class Email {
  static transporter: Transporter;

  abstract templatePath: string;
  data?: { [key: string]: unknown };

  protected constructor() {
    if (Email.transporter === null) {
      Email.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: true,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  send = async () => {
    const options: Mail.Options = {};
    options.from = (options.from as string).replace(/ /g, "__");
    options.to = (options.to as string).replace(/ /g, "__");
    options.subject = this.getSubject();

    console.log(`Sending email of type ${typeof this} to ${options.to}`);

    try {
      await Email.transporter.sendMail(options);
      if (options.to !== process.env.SMTP_USERNAME) {
        options.subject = `[Sent to ${options.to}] ${options.subject}`;
        options.to = process.env.SMTP_USERNAME;
        console.log(`Sending email of type ${typeof this} to ${options.to}`);
        try {
          await Email.transporter.sendMail(options);
        } catch (e) {
          console.log(
            `Can't send e-mail '${JSON.stringify(options)}': failed with ${e}`
          );
        }
      }
    } catch (e) {
      console.log(
        `Can't send e-mail '${JSON.stringify(options)}': failed with ${e}`
      );
    }
  };

  abstract getFrom(): string;
  abstract getFromName(): string;
  abstract getTo(): string;
  abstract getToName(): string;
  abstract getSubject(): string;
  abstract getTextBody(): string;

  getHtmlBody = async () =>
    await ejs.renderFile(
      path.join(this.templatePath, "template.ejs"),
      { __: i18n.__, ...this.data },
      {}
    );
}
