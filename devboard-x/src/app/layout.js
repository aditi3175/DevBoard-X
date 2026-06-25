import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext"
import { ProjectProvider } from "@/context/ProjectContext"
import { ActivityProvider } from "@/context/ActivityContext"
import ConvexClientProvider from "@/components/providers/ConvexClientProvider"
import CommandPalette from "@/components/layout/CommandPalette"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('devboard-theme');
                if (theme === '"dark"' || theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (theme === '"light"' || theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden font-sans">
        <ThemeProvider>
          <ConvexClientProvider>
            <ProjectProvider>
              <ActivityProvider>
                <CommandPalette />
                <div className="flex h-screen overflow-hidden w-full">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                    <Navbar />
                    <main className="flex-1 flex flex-col relative w-full">
                      {children}
                    </main>
                  </div>
                </div>
              </ActivityProvider>
            </ProjectProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
