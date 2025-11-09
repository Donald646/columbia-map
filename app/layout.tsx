import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { MapProviderContext } from "@/lib/map-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EventsCU - Campus Events Discovery",
    template: "%s | EventsCU",
  },
  description: "Discover campus events on an interactive map. Find parties, club meetings, sports events, and more at your school.",
  keywords: ["college events", "university events", "campus map", "student events", "event discovery"],
  authors: [{ name: "EventsCU" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "EventsCU",
    title: "EventsCU - Campus Events Discovery",
    description: "Discover campus events on an interactive map. Find parties, club meetings, sports events, and more at your school.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventsCU - Campus Events Discovery",
    description: "Discover campus events on an interactive map.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MapProviderContext>
          {children}
        </MapProviderContext>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
