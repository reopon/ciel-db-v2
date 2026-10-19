import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // 旧URLからのリダイレクト。SNS等で既に共有されたリンクを無効にしないため。
  // /archive は検索+月別リスト機能ごと /events に引き継いだ(一時的に
  // /calendar という名前だった時期があるが、/calendar は現在は別物
  // — 月間カレンダーが縦に並ぶ新しいページ — になっている)。
  // /archive/[year]/[month] は中身がそのまま /calendar/[year]/[month] に
  // あるので変更なし。
  async redirects() {
    return [
      { source: "/archive", destination: "/events", permanent: true },
      { source: "/archive/:year/:month", destination: "/calendar/:year/:month", permanent: true },
    ];
  },
};

export default nextConfig;
