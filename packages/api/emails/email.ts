import * as ejs from "ejs";
import { I18n } from "i18n";
import type { Transporter, TransportOptions } from "nodemailer";
import nodemailer from "nodemailer";
import type { Address } from "nodemailer/lib/mailer";
import type Mail from "nodemailer/lib/mailer";
import path from "path";

import en from "../translations/messages.en.json";
const fr = Object.fromEntries(Object.keys(en).map((key) => [key, key]));

export const i18n = new I18n({
  locales: ["fr", "en-US"],
  defaultLocale: "fr",
  staticCatalog: {
    "en-US": Object.fromEntries(Object.entries(en)),
    fr,
  },
});

export abstract class Email {
  static transporter: Transporter;

  abstract templatePath: string;
  data?: { [key: string]: unknown };

  sendCopyToAdmin = true;

  protected constructor() {
    if (!Email.transporter) {
      Email.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      } as TransportOptions);
    }
  }

  send = async () => {
    const options: Mail.Options = {
      from: {
        name: this.getFromName(),
        address: this.getFrom().replace(/ /g, "__"),
      },
      to: {
        name: this.getToName(),
        address: this.getTo().replace(/ /g, "__"),
      },
      html: await this.getHtmlBody(),
      text: this.getTextBody(),
      subject: this.getSubject(),
    };

    const to = options.to as Mail.Address;
    console.log(
      `Sending email of type ${this.getTemplateDirName()} to ${to.address}`,
    );

    try {
      await Email.transporter.sendMail(options);
      if (
        this.sendCopyToAdmin &&
        (options.to as Address).address !== process.env.SMTP_USERNAME
      ) {
        options.subject = `[Sent to ${to.address}] ${options.subject}`;
        options.to = process.env.SMTP_USERNAME;
        console.log(
          `Sending email of type ${this.getTemplateDirName()} to ${options.to}`,
        );
        await Email.transporter.sendMail(options);
      }
    } catch (e) {
      console.error(
        `Can't send e-mail '${JSON.stringify(options)}': failed with ${e}`,
      );
      return Promise.reject(e);
    }
  };

  getHtmlBody = () =>
    ejs.renderFile(
      path.join(this.templatePath, "template.ejs"),
      { __: i18n.__, ...this.data },
      {},
    );

  getTemplateDirName = (): string =>
    this.templatePath.match(/(?<=\/)[^/]+$/)![0];

  abstract getFrom(): string;
  abstract getFromName(): string;
  abstract getTo(): string;
  abstract getToName(): string;
  abstract getSubject(): string;
  getTextBody = (): string => "";
}
