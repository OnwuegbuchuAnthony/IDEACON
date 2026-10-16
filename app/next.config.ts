import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatar/logo URLs are user-supplied; presigned R2 URLs resolve per request.
    // Remote patterns stay closed — add hosts here only when needed.
    remotePatterns: [],
  },
};

export default nextConfig;
