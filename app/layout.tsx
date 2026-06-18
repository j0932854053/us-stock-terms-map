import type { Metadata } from "next";
import "./globals.css";

const assetBasePath =
  process.env.BUILD_TARGET === "pages"
    ? (process.env.PAGES_BASE_PATH ?? "/us-stock-terms-map")
    : "";

export const metadata: Metadata = {
  title: "美股投資術語地圖",
  description: "繁體中文美股投資專有名詞互動查詢工具。",
  icons: {
    icon: `${assetBasePath}/favicon.svg`,
    shortcut: `${assetBasePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
