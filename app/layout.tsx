import { AuthProvider } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/ToastProvider";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FixItNow | Trusted Home Services", template: "%s | FixItNow" },
  description: "Find and book trusted home-service professionals with secure payments and role-protected dashboards.",
  applicationName: "FixItNow",
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#102a43" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
