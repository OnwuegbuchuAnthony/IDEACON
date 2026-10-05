import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY ?? "";
const from = process.env.EMAIL_FROM ?? "IDEACON <dev@localhost>";

const resend = apiKey !== "" ? new Resend(apiKey) : null;

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    // Phase 0: log instead of sending so onboarding works before DNS is set up.
    console.log(`[email:dev] to=${input.to} subject=${input.subject}`);
    return;
  }
  await resend.emails.send({ from, ...input });
}
