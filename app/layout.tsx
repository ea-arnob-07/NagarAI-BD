import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NagarAI BD · Civic complaint intelligence",
  description:
    "A bilingual six-model civic complaint classification, priority and duplicate-detection demonstrator for Bangladesh.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
