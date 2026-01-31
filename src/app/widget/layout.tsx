import "../globals.css";
import "./embed.css";
import { Inter, Caveat, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwritten",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${caveat.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Detect Notion's dark mode or system preference
                try {
                  // Check if embedded in Notion (dark mode detection)
                  var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                  // Also check URL param for explicit theme
                  var params = new URLSearchParams(window.location.search);
                  var themeParam = params.get('theme');
                  if (themeParam === 'dark') isDark = true;
                  if (themeParam === 'light') isDark = false;

                  if (isDark) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="widget-embed antialiased">{children}</body>
    </html>
  );
}
