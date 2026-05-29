import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { FloatingNav } from "@/components/ui/floating-nav";
import { FloatingBack } from "@/components/ui/floating-back";
import { ConnectionIndicator } from "@/components/ui/connection-indicator";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "GymTracker",
  description: "Kişisel antrenman takip uygulaması — set, tekrar, RIR, ağırlık.",
  applicationName: "GymTracker",
  appleWebApp: {
    capable: true,
    title: "GymTracker",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    // iOS standalone mode hint (older iOS still honors this in addition to
    // apple-mobile-web-app-capable)
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#003876" },
    { media: "(prefers-color-scheme: light)", color: "#003876" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-bg text-fg antialiased">
        <ConnectionIndicator />
        {children}
        <FloatingBack />
        <FloatingNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
