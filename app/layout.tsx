import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "./ui/authSessionProvider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillHub",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/myskillhubfavicon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/myskillhubfavicon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/myskillhubfavicon.jpg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

import { Toaster } from "@/components/ui/toaster";
import { BookAIcon } from "lucide-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  );
}
