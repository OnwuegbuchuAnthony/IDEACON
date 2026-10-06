import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // flip to true once Resend domain is verified
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your IDEACON password",
        html: `<p>Hi ${user.name},</p><p>Reset your password: <a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your IDEACON email",
        html: `<p>Hi ${user.name},</p><p>Verify your email: <a href="${url}">${url}</a></p>`,
      });
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CREATOR", required: false },
      creatorType: { type: "string", required: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Every signup path (email, Google) gets a creator stub + audit.
        // Company registration upgrades role + adds company rows later.
        after: async (user) => {
          try {
            await db.creatorProfile.upsert({
              where: { userId: user.id },
              update: {},
              create: { userId: user.id, creatorType: "CASUAL" },
            });
          } catch {
            /* profile already exists — safe to ignore */
          }
          // Automatic welcome email (non-blocking).
          try {
            const { sendEmail } = await import("./email");
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
            await sendEmail({
              to: user.email,
              subject: "Welcome to IDEACON ◈",
              html: `<p>Hi ${user.name},</p><p>Your account is ready. Creators: <a href="${appUrl}/submit">submit your first idea</a>. Companies: <a href="${appUrl}/browse">discover vetted teasers</a>.</p><p>Ideas stay teaser-only until an NDA is signed — your work is protected by design.</p>`,
              name: user.name,
            });
          } catch (e) {
            console.warn("[welcome-email]", e instanceof Error ? e.message : e);
          }
        },
      },
    },
  },
});
