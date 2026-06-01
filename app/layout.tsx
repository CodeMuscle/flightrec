import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flightrec.dev"),
  title: "Flightrec — Time-travel debugger for Next.js App Router",
  description:
    "Flightrec records a full Next.js session as a replayable execution trace. Scrub the timeline to see exactly which Server Action ran, which cache tags changed, what RSC payload streamed, what cookies/headers mutated, and how the client tree reacted — all in one view.",
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
      "The flight recorder for your App Router. Replay Server Actions, cache, RSC payloads, and client reconciliation on one timeline.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
