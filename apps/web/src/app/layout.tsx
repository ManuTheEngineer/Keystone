import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeInit } from "@/components/ui/ThemeInit";
import { ToastProvider } from "@/components/ui/Toast";
import { QueryProvider } from "@/lib/query-client";
import { logEnvValidation } from "@/lib/env";
import "./globals.css";

// Validate environment variables on server startup
logEnvValidation();

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking theme init — applies dark mode class before first paint.
            CRITICAL: Only modifies attributes on existing elements. Never
            remove/create DOM nodes — that breaks React hydration. The content
            is a static string with no user input (reads from localStorage only). */}
        <script dangerouslySetInnerHTML={{ __html: "try{var s=localStorage.getItem('keystone-theme');if(s==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.backgroundColor='#2C1810';document.documentElement.style.colorScheme='dark';var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.setAttribute('content','#F5E6D3');var ic=document.querySelector('link[rel=\"icon\"][type=\"image/svg+xml\"]');if(ic)ic.setAttribute('href','/favicon-dark.svg');}}catch(e){}" }} />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <ThemeInit />
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
