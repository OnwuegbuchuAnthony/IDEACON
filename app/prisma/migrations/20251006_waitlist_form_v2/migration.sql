-- Waitlist form v2: role set (creator/company/student/other, stored in the
-- existing "kind" column via @map), optional Nigerian state, consent record.
-- Applied via `prisma db push` (this repo's push-based workflow); kept here
-- as the reviewable record.
ALTER TABLE "WaitlistEntry" ADD COLUMN "state" TEXT;
ALTER TABLE "WaitlistEntry" ADD COLUMN "university" TEXT;
ALTER TABLE "WaitlistEntry" ADD COLUMN "department" TEXT;
ALTER TABLE "WaitlistEntry" ADD COLUMN "consent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WaitlistEntry" ADD COLUMN "consentedAt" TIMESTAMP(3);
