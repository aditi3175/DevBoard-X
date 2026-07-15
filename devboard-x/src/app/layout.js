import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext"
import ConvexClientProvider from "@/components/providers/ConvexClientProvider"

export const metadata = {
  title: {
    template: "%s | DevBoard X",
    default: "DevBoard X - Developer Dashboard",
  },
  description: "A centralized dashboard for project management, task tracking, and workspace analytics.",
  openGraph: {
    title: "DevBoard X",
    description: "A centralized dashboard for project management, task tracking, and workspace analytics.",
    url: "https://devboardx.com",
    siteName: "DevBoard X",
    locale: "en_US",
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('devboard-theme');
                if (t) { t = t.replace(/"/g, ''); }
                if (t === 'light' || t === 'dark') {
                  document.documentElement.dataset.theme = t;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden font-sans">
        <ThemeProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
