import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionConfig } from "framer-motion";
import AmbientBackground from "@/components/layout/AmbientBackground";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import "./globals.css";

const geist = localFont({ src: "../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2", variable: "--font-geist", weight: "100 900", display: "swap" });
const editorial = localFont({ src: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2", variable: "--font-editorial", weight: "200 800", style: "italic", display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const validSiteUrl = siteUrl && /^https?:\/\//.test(siteUrl) ? siteUrl : "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(validSiteUrl),
  title: { default: "Harshit Presentation Hub — Less searching. More learning.", template: "%s · Harshit Presentation Hub" },
  description: "Discover presentations, notes and study resources in one thoughtfully organized hub. Find your next resource and open it at its original source. No student account needed.",
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Harshit Presentation Hub", title: "Less searching. More learning.", description: "Good resources deserve a better home. Discover your next study resource, without the endless searching.", url: "/" },
  twitter: { card: "summary", title: "Harshit Presentation Hub", description: "Less searching. More learning." },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#090b10" }, { media: "(prefers-color-scheme: light)", color: "#f8f9fc" }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" data-theme="dark" className={`${geist.variable} ${editorial.variable}`}>
    <body>
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('presentation-hub-theme')||'dark';var e=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;if(e!=='light'&&e!=='dark')e='dark';document.documentElement.dataset.theme=e;document.documentElement.classList.toggle('dark',e==='dark');if(localStorage.getItem('presentation-hub-projector')==='true')document.documentElement.classList.add('projector-mode');}catch(e){}})();` }} />
      <MotionConfig reducedMotion="user">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AmbientBackground />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </MotionConfig>
    </body>
  </html>;
}
