import { db } from "./db";

/** Broker-mediated inbox. Call alongside audit events on key transitions. */
export async function notify(input: {
  userId: string;
  kind: string;
  title: string;
  link?: string;
}) {
  return db.notification.create({ data: input });
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
