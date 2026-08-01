import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Newsreader } from "next/font/google";
import AmbientBackground from "@/components/layout/AmbientBackground";
import ThemeToggle from "@/components/theme/ThemeToggle";
import ProjectorModeToggle from "@/components/projector/ProjectorModeToggle";
import CommandTrigger from "@/components/command/CommandTrigger";
import "@/app/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-editorial",
});

export const metadata: Metadata = {
  title: "Harshit Presentation Hub",
  description: "Premium presentation hub for classroom presentations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
        <meta name="theme-color" content="#050505" />
      </head>
      <body
        className={`${geist.variable} ${newsreader.variable} antialiased bg-[#050505] text-[#f8fafc]`}
      >
        {/* Theme and projector init script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var themeKey = 'presentation-hub-theme';
                  var saved = localStorage.getItem(themeKey);
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || 'dark';
                  var effectiveTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
                  document.documentElement.setAttribute('data-theme', effectiveTheme);
                  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
                  var metaTheme = document.querySelector('meta[name="theme-color"]');
                  if (metaTheme) {
                    metaTheme.setAttribute('content', effectiveTheme === 'dark' ? '#050505' : '#f1f5f9');
                  }
                  var projectorKey = 'presentation-hub-projector';
                  if (localStorage.getItem(projectorKey) === 'true') {
                    document.documentElement.classList.add('projector-mode');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />

        {/* Skip link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <AmbientBackground />
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header
            className="sticky top-0 z-50 backdrop-blur-2xl bg-[#050505]/80 border-b border-white/[0.06]"
            role="banner"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="font-[family-name:var(--font-editorial)] text-lg md:text-xl font-semibold tracking-tight text-[#f8fafc] hover:text-indigo-300 transition-colors"
                aria-label="Harshit Presentation Hub - Go to homepage"
              >
                Harshit Presentation Hub
              </Link>
              <nav
                className="flex items-center gap-2"
                role="navigation"
                aria-label="Main navigation"
              >
                <CommandTrigger />
                <ProjectorModeToggle />
                <ThemeToggle />
              </nav>
            </div>
          </header>
          
          {/* Main content */}
          <main
            id="main-content"
            className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10"
            role="main"
          >
            {children}
          </main>
          
          {/* Footer */}
          <footer
            className="border-t border-white/[0.06] py-6"
            role="contentinfo"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
              <p className="text-xs text-[#475569]">
                Harshit Presentation Hub · Built for classroom presentations
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
