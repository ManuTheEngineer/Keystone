import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeInit } from "@/components/ui/ThemeInit";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keystone - From First Idea to Final Key",
  description:
    "Construction project lifecycle management for owner-builders. Guides you from initial idea through financing, design, construction, and occupancy.",
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
        <script dangerouslySetInnerHTML={{ __html: `try{var s=localStorage.getItem('keystone-theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(s!=='light'&&s!=='system'&&d)||(s==='system'&&d)){var r=document.documentElement;r.classList.add('dark');r.style.setProperty('--color-background','#1A1412');r.style.setProperty('--color-foreground','#E8DDD0');r.style.setProperty('--color-surface','#231E1A');r.style.setProperty('--color-surface-alt','#2C2520');r.style.setProperty('--color-border','#3D342C');r.style.setProperty('--color-muted','#9A8E82');r.style.setProperty('--color-earth','#E8DDD0');r.style.setProperty('--color-warm','#2C2520');document.body.style.backgroundColor='#2C1810';document.body.style.color='#E8DDD0';}}catch(e){}` }} />
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
