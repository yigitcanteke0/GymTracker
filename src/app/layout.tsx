import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { FloatingNav } from "@/components/ui/floating-nav";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Kişisel antrenman takip uygulaması",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 antialiased">
        {children}
        <FloatingNav />
      </body>
    </html>
  );
}
