import { StudentWaitlistForm } from "./StudentForm";
import { Container, PageIntro, Section } from "@/app/components/Container";
import { pageMeta } from "@/lib/seo";

const PARTNER_STEPS: [string, string][] = [
  [
    "Hackathons",
    "List your hackathon with us — winning builds flow straight into review, not into a drawer.",
  ],
  [
    "Final-year projects",
    "Nominate standout capstones each semester; we handle teaser, scoring, and broker intro.",
  ],
  [
    "Ambassador programme",
    "One trained student contact per campus who runs intake drives and office hours.",
  ],
];

export const metadata = pageMeta({
  title: "Students — IDEACON",
  description: "Why universities and student innovators join IDEACON.",
  path: "/students",
});

export default function StudentsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageIntro
        eyebrow="For you · Students & universities"
        title="Don’t let it die with the semester"
        lede="Universities sit on a renewable goldmine — final-year builds, theses, and hackathon prototypes with real commercial potential. Student innovators get exposure, mentorship, portfolio proof, and a shot at income while still in school. Partner campuses get a front-row seat to the ideas their students produce."
      />

      <Section ariaLabel="How a campus partners with IDEACON">
        <Container>
          <h2 className="font-display text-xl font-bold">
            How a campus partners with IDEACON
          </h2>
          <ol className="mt-3 flex flex-col gap-2">
            {PARTNER_STEPS.map(([t, d], i) => (
              <li
                key={t}
                className="rounded-2xl border border-border bg-surface p-4 shadow"
              >
                <p className="font-display text-sm font-bold">
                  <span
                    aria-hidden="true"
                    className="mr-2 rounded-full bg-teal px-2.5 py-0.5 text-xs font-extrabold text-surface"
                  >
                    {i + 1}
                  </span>
                  {t}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section ariaLabel="Join the student waitlist">
        <Container>
          <StudentWaitlistForm />
          <p className="mt-3 text-center text-xs text-ink/50">
            One email at launch. No spam, no sharing — ever.
          </p>
        </Container>
      </Section>
    </main>
  );
}
