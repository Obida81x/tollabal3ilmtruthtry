import { logger } from "./logger";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function getFromAddress(): string | null {
  return process.env.RESEND_FROM_EMAIL ?? process.env.SENDGRID_FROM_EMAIL ?? null;
}

export async function sendEmail(input: SendEmailInput): Promise<{
  delivered: boolean;
  reason?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getFromAddress();

  console.log(`[Email] Sending to=${input.to}, subject="${input.subject}", configured=${!!(apiKey && from)}`);

  if (!apiKey || !from) {
    console.warn(`[Email] NOT DELIVERED: RESEND_API_KEY=${!!apiKey}, FROM_EMAIL=${!!from}`);
    logger.warn(
      { to: input.to, subject: input.subject, body: input.text },
      "Email not delivered: RESEND_API_KEY / RESEND_FROM_EMAIL are not configured.",
    );
    return {
      delivered: false,
      reason: "email-not-configured",
    };
  }

  try {
    const payload: Record<string, unknown> = {
      from: `Students of Islamic Law <${from}>`,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    };

    console.log(`[Email] Calling Resend API, from=${from}`);

    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[Email] Resend rejected: status=${res.status}, detail=${detail}`);
      logger.error(
        { status: res.status, detail, to: input.to },
        "Resend rejected the email",
      );
      return { delivered: false, reason: `resend-${res.status}` };
    }

    console.log(`[Email] Delivered successfully to ${input.to}`);
    return { delivered: true };
  } catch (err) {
    console.error(`[Email] Fetch failed:`, err);
    logger.error({ err }, "Resend call failed");
    return { delivered: false, reason: "resend-fetch-failed" };
  }
}

export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && (process.env.RESEND_FROM_EMAIL ?? process.env.SENDGRID_FROM_EMAIL));
}
