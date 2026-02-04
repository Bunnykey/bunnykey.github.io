import "../globals.css";
import "./embed.css";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="font-sans" suppressHydrationWarning>
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
