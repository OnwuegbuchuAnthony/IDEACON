import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatar/logo URLs are user-supplied; presigned R2 URLs resolve per request.
    // Remote patterns stay closed — add hosts here only when needed.
    remotePatterns: [],
  },
  async redirects() {
    // /browse was the old browsing route and /niches an alias for the same
    // catalogue; /discover is canonical now. A permanent redirect preserves
    // inbound links, bookmarks and any query string
    // (e.g. /browse?niche=FINTECH -> /discover?niche=FINTECH).
    return [
      { source: "/browse", destination: "/discover", permanent: true },
      { source: "/niches", destination: "/discover", permanent: true },
    ];
  },
};

export default nextConfig;
