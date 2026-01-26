import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MobileNavbar } from "@/components/layout/MobileNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Warung Salsabila POS",
  description: "Low-Cost Mobile Cloud POS",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <main className="pb-20 min-h-screen bg-gray-50">
            {children}
        </main>
        <MobileNavbar />
        <Toaster />
      </body>
    </html>
  );
}
