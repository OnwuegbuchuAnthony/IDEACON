/**
 * Transactional email, in priority order:
 * 1. ZeptoMail (Zoho) — needs ZEPTOMAIL_TOKEN + verified domain in EMAIL_FROM.
 * 2. Gmail SMTP — needs GMAIL_USER + GMAIL_APP_PASSWORD (no domain needed,
 *    good for pilot; 500/day limit). Get the app password at
 *    Google Account → Security → 2-Step Verification → App passwords.
 * 3. Console log — so onboarding works before any provider is set up.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  name?: string;
}): Promise<void> {
  const zeptoToken = process.env.ZEPTOMAIL_TOKEN ?? "";
  if (zeptoToken) {
    await sendViaZepto(input, zeptoToken);
    return;
  }
  const gmailUser = process.env.GMAIL_USER ?? "";
  const gmailPass = (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s/g, "");
  if (gmailUser && gmailPass) {
    await sendViaGmail(input, gmailUser, gmailPass);
    return;
  }
  console.log(`[email:dev] to=${input.to} subject=${input.subject}`);
}

async function sendViaZepto(
  input: { to: string; subject: string; html: string; name?: string },
  token: string,
): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "IDEACON <dev@localhost>";
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

async function sendViaGmail(
  input: { to: string; subject: string; html: string; name?: string },
  user: string,
  pass: string,
): Promise<void> {
  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const fromName = (process.env.EMAIL_FROM ?? "").match(/^(.*)</)?.[1].trim() || "IDEACON";
  await transporter.sendMail({
    from: { name: fromName, address: user },
    to: { name: input.name ?? input.to, address: input.to },
    subject: input.subject,
    html: input.html,
  });
}
