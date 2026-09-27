"use server";

import { requireUser } from "./session";
import { castVote } from "./voting";
import { redirect } from "next/navigation";

export async function voteAction(ideaId: string, value: 1 | -1) {
  const user = await requireUser();
  await castVote({ ideaId, userId: user.id, value });
  redirect(`/ideas/${ideaId}`);
}
