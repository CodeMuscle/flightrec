import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rewindscope.dev"),
  title: "Rewindscope — Time-travel debugger for Next.js App Router",
  description:
    "Rewind a Next.js session and inspect exactly which Server Action ran, which cache tags changed, what RSC payload streamed, what cookies/headers mutated, and how the client tree reacted — all on one timeline.",
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
    title: "Rewindscope — Time-travel debugger for Next.js",
    description:
      "Record a full App Router session as a replayable execution trace. Scrub the timeline across Server Actions, cache, RSC payloads, and the client tree.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
