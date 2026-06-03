import { logger } from "./logger";
import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail(input: SendEmailInput): Promise<{
  delivered: boolean;
  reason?: string;
}> {
  const transporter = createTransporter();
  const from = process.env.GMAIL_USER;

  console.log(`[Email] Sending to=${input.to}, subject="${input.subject}", configured=${!!transporter}`);

  if (!transporter || !from) {
    console.warn(`[Email] NOT DELIVERED: GMAIL_USER or GMAIL_APP_PASSWORD not set`);
    logger.warn(
      { to: input.to, subject: input.subject },
      "Email not delivered: Gmail credentials not configured.",
    );
    return { delivered: false, reason: "email-not-configured" };
  }

  try {
    await transporter.sendMail({
      from: `Students of Islamic Law <${from}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });

    console.log(`[Email] Delivered successfully to ${input.to}`);
    return { delivered: true };
  } catch (err) {
    console.error(`[Email] Gmail SMTP failed:`, err);
    logger.error({ err }, "Gmail SMTP failed");
    return { delivered: false, reason: "gmail-smtp-failed" };
  }
}

export function isEmailConfigured(): boolean {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}
