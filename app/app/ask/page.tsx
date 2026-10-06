import { AskChat } from "./AskChat";

export const metadata = {
  title: "Ask IDEACON AI",
  description: "Ask me anything — answers grounded in the live idea catalog.",
};

export default function AskPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Ask me anything</h1>
      <p className="text-sm text-ink/60">Grounded in live teasers. Login required. Full details stay NDA-locked.</p>
      <AskChat />
    </main>
  );
}
