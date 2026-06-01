import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flightrec.dev"),
  title: "Flightrec — Time-travel debugger for Next.js App Router",
  description:
    "Stop guessing what went wrong. Rewind your Next.js session and inspect every state change — Server Actions, cache, RSC payloads, cookies/headers, and the client tree — with absolute clarity.",
  keywords: [
    "Next.js",
    "React Server Components",
    "Server Actions",
    "time-travel debugger",
    "App Router",
    "cache invalidation",
    "RSC",
  ],
  openGraph: {
    title: "Flightrec — Time-travel debugger for Next.js",
    description:
      "Rewind your Next.js session and inspect every state change with absolute clarity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
