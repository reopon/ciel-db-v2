import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // /archive -> /calendar のURL変更に伴う旧URLからのリダイレクト。
  // SNS等で既に共有された /archive リンクを無効にしないため。
  async redirects() {
    return [
      { source: "/archive", destination: "/calendar", permanent: true },
      { source: "/archive/:year/:month", destination: "/calendar/:year/:month", permanent: true },
    ];
  },
};

export default nextConfig;
