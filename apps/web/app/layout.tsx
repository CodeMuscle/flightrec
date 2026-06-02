import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Debugging, rewound. Flightrec records a full Next.js session as a replayable trace — Server Actions, cache invalidation, RSC payloads, cookies/headers, and the client tree — and lets you scrub it on one timeline.";

export const metadata: Metadata = {
  metadataBase: new URL("https://flightrec.dev"),
  title: {
    default: "Flightrec — Time-travel debugger for the Next.js App Router",
    template: "%s — Flightrec",
  },
  description: DESCRIPTION,
  applicationName: "Flightrec",
  keywords: [
    "Next.js",
    "React Server Components",
    "Server Actions",
    "time-travel debugger",
    "App Router",
    "cache invalidation",
    "RSC",
    "Flight protocol",
  ],
  authors: [{ name: "buildwithgg", url: "https://x.com/buildwithgg" }],
  creator: "buildwithgg",
  openGraph: {
    title: "Flightrec — Time-travel debugger for the Next.js App Router",
    description: DESCRIPTION,
    url: "https://flightrec.dev",
    siteName: "Flightrec",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flightrec — Time-travel debugger for the Next.js App Router",
    description: "Debugging, rewound. Rewind your Next.js session on one timeline.",
    creator: "@buildwithgg",
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
