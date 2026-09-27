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
});
