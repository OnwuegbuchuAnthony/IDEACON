// Gmail SMTP live test: sends to the account itself.
import { config } from "dotenv";
import nodemailer from "nodemailer";

config({ path: ".env.local" });
config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s/g, ""),
  },
});

await transporter.sendMail({
  from: { name: "IDEACON", address: process.env.GMAIL_USER ?? "" },
  to: { address: process.env.GMAIL_USER ?? "" },
  subject: "IDEACON email is live",
  html: "<p>Your Gmail SMTP integration works. System mail (verifications, digests, NDA alerts) will now actually send.</p>",
});
console.log("gmail-test-sent");
