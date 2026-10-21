import { notFound } from "next/navigation";
import { LoginPreview } from "./LoginPreview";

/** Dev-only preview of the login modal — always 404 in production. */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login modal preview (dev)",
  robots: { index: false },
};

export default function DevLoginPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LoginPreview />;
}
