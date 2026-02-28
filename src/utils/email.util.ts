import nodemailer from "nodemailer";
import { ENV } from "../config/env";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT),
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: ENV.SMTP_FROM,
    to,
    subject,
    html,
  });
};
