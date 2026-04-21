import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { getCurrentRole } from "@/lib/auth.server";
import "./globals.scss";
import styles from "./layout.module.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trail Reports",
  description:
    "Internal reports console for the Trail trial task — Next.js App Router + TypeScript.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getCurrentRole();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={styles.body}>
        <SiteHeader role={role} />
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <span>Trail trial task</span>
          <span className={styles.dot} aria-hidden>
            ·
          </span>
          <span>Next.js App Router + Supabase-ready</span>
        </footer>
      </body>
    </html>
  );
}
