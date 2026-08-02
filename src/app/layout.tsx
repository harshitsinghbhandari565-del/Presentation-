import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import AmbientBackground from "@/components/layout/AmbientBackground";
import { VaultToastProvider } from "@/components/primitive/toast/VaultToast";
import { ShellSelector } from "@/components/layout/ShellSelector";
import "@/styles/main.css";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
    <html lang="en" suppressHydrationWarning data-theme="dark" className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#0A0A0C" />
      </head>
      <body className="antialiased bg-[var(--color-surface-base)] text-[var(--color-text-primary)] transition-colors duration-300">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var themeKey = 'ph-theme-preference';
                  var saved = localStorage.getItem(themeKey);
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (systemDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  var metaTheme = document.querySelector('meta[name="theme-color"]');
                  if (metaTheme) {
                    metaTheme.setAttribute('content', theme === 'dark' ? '#0A0A0C' : '#F5F3F0');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />

        <AmbientBackground />
        <VaultToastProvider>
           <ShellSelector>
              {children}
           </ShellSelector>
        </VaultToastProvider>
      </body>
    </html>
  );
}
