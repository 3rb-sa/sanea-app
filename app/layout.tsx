import type { Metadata, Viewport } from "next";
import { El_Messiri, Tajawal } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { TripsProvider } from "@/lib/trips";
import { AppShell } from "@/components/app-shell";

const elMessiri = El_Messiri({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-body",
});

const description = "سنع تطبيق ينزّل السواقين رحلاتهم بين المدن، وأي حد رايح نفس الطريق يتواصل معهم مباشرة";

export const metadata: Metadata = {
  title: "سنع",
  description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "سنع",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html dir="rtl" lang="ar" className={`${elMessiri.variable} ${tajawal.variable}`}>
      <body className="h-dvh overflow-hidden overscroll-none bg-bg text-text antialiased">
        <AuthProvider>
          <TripsProvider>
            <AppShell>{children}</AppShell>
          </TripsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
