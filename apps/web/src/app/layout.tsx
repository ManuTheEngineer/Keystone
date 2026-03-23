import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeInit } from "@/components/ui/ThemeInit";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keystone",
  description:
    "Construction project lifecycle management for owner-builders. Guides you from initial idea through financing, design, construction, and occupancy.",
  openGraph: {
    title: "Keystone",
    description: "From first idea to final key. Construction project management for owner-builders.",
    type: "website",
    siteName: "Keystone",
  },
  twitter: {
    card: "summary",
    title: "Keystone",
    description: "From first idea to final key. Construction project management for owner-builders.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keystone",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2C1810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Blocking theme init — runs before React to prevent flash. Only reads from localStorage (safe, no user input). */}
        <script dangerouslySetInnerHTML={{ __html: `try{var s=localStorage.getItem('keystone-theme');if(s==='dark'){document.documentElement.classList.add('dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#F5E6D3');}}catch(e){}` }} />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>
            <ThemeInit />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
