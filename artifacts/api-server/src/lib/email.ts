import { logger } from "./logger";

const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function getFromAddress(): { email: string; name: string } | null {
  const email = process.env.SENDGRID_FROM_EMAIL;
  if (!email) return null;
  return {
    email,
    name: process.env.EMAIL_FROM_NAME ?? "Students of Islamic Law",
  };
}

export async function sendEmail(input: SendEmailInput): Promise<{
  delivered: boolean;
  reason?: string;
}> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = getFromAddress();

  console.log(`[Email] Sending to=${input.to}, subject="${input.subject}", configured=${!!(apiKey && from)}`);

  if (!apiKey || !from) {
    console.warn(`[Email] NOT DELIVERED: SENDGRID_API_KEY=${!!apiKey}, SENDGRID_FROM_EMAIL=${!!from?.email}`);
    logger.warn(
      { to: input.to, subject: input.subject, body: input.text },
      "Email not delivered: SENDGRID_API_KEY / SENDGRID_FROM_EMAIL are not configured. Logging the message instead.",
    );
    return {
      delivered: false,
      reason: "email-not-configured",
    };
  }

  try {
    const payload = {
      personalizations: [{ to: [{ email: input.to }] }],
      from,
      subject: input.subject,
      ...(input.replyTo ? { reply_to: { email: input.replyTo } } : {}),
      content: [
        { type: "text/plain", value: input.text },
        ...(input.html
          ? [{ type: "text/html", value: input.html }]
          : []),
      ],
    };
    console.log(`[Email] Calling SendGrid API, from=${from.email}`);

    const res = await fetch(SENDGRID_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[Email] SendGrid rejected: status=${res.status}, detail=${detail}`);
      logger.error(
        { status: res.status, detail, to: input.to },
        "SendGrid rejected the email",
      );
      return { delivered: false, reason: `sendgrid-${res.status}` };
    }
    console.log(`[Email] Delivered successfully to ${input.to}`);
    return { delivered: true };
  } catch (err) {
    console.error(`[Email] Fetch failed:`, err);
    logger.error({ err }, "SendGrid call failed");
    return { delivered: false, reason: "sendgrid-fetch-failed" };
  }
}

export function isEmailConfigured(): boolean {
  return !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}
