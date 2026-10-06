import { db } from "./db";

/** Broker-mediated inbox. Call alongside audit events on key transitions. */
export async function notify(input: {
  userId: string;
  kind: string;
  title: string;
  link?: string;
  emailSubject?: string;
  emailHtml?: string;
}) {
  const row = await db.notification.create({
    data: { userId: input.userId, kind: input.kind, title: input.title, link: input.link },
  });
  // Mirror essential events to email. Failures never break the flow.
  if (input.emailSubject && input.emailHtml) {
    try {
      const user = await db.user.findUnique({ where: { id: input.userId } });
      if (user) {
        const { sendEmail } = await import("./email");
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        await sendEmail({
          to: user.email,
          subject: input.emailSubject,
          html: `${input.emailHtml}<p><a href="${appUrl}${input.link ?? "/dashboard"}">Open in IDEACON →</a></p>`,
          name: user.name,
        });
      }
    } catch (e) {
      console.warn("[notify-email]", e instanceof Error ? e.message : e);
    }
  }
  return row;
}

export async function unreadCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, readAt: null } });
}

export async function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
