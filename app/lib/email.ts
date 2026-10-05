/**
 * Transactional email via ZeptoMail (Zoho).
 * Needs ZEPTOMAIL_TOKEN (Mail Agent → Send Mail Token) and a verified
 * sending domain in EMAIL_FROM. Falls back to console logging when unset
 * so onboarding works before DNS is set up.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  name?: string;
}): Promise<void> {
  const token = process.env.ZEPTOMAIL_TOKEN ?? "";
  const from = process.env.EMAIL_FROM ?? "IDEACON <dev@localhost>";
  if (!token) {
    console.log(`[email:dev] to=${input.to} subject=${input.subject}`);
    return;
  }

  const address = from.match(/<(.*)>/)?.[1] ?? from;
  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { address },
      to: [{ email_address: { address: input.to, name: input.name ?? input.to } }],
      subject: input.subject,
      htmlbody: input.html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ZeptoMail ${res.status}: ${text.slice(0, 200)}`);
  }
}
