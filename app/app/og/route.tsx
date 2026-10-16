import { ImageResponse } from "next/og";

/** Dynamic OG image: /og?title=..&sub=.. (1200x630, brand gradient). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "IDEACON").slice(0, 80);
  const sub = (searchParams.get("sub") ?? "Idea + Connection").slice(0, 120);
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "linear-gradient(120deg, #0B3D91, #0F62FE 55%, #00C2A8)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 42, fontWeight: 700, opacity: 0.85 }}>◈ IDEACON</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>{title}</div>
        <div style={{ fontSize: 34, opacity: 0.85, marginTop: 12 }}>{sub}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
