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
        {/* Blocking theme init + persistent theme-color observer. Only reads localStorage (safe, no user input). */}
        <script dangerouslySetInnerHTML={{ __html: `try{var s=localStorage.getItem('keystone-theme');var dk=s==='dark';var tc=dk?'#F5E6D3':'#2C1810';if(dk){document.documentElement.classList.add('dark');document.documentElement.style.backgroundColor='#2C1810';document.documentElement.style.colorScheme='dark';}var old=document.querySelectorAll('meta[name="theme-color"]');old.forEach(function(e){e.remove();});var nm=document.createElement('meta');nm.name='theme-color';nm.content=tc;document.head.appendChild(nm);window.__ksThemeColor=tc;window.__ksFavicon=dk?'/favicon-dark.svg':'/favicon.svg';new MutationObserver(function(){var el=document.querySelector('meta[name="theme-color"]');if(el&&el.getAttribute('content')!==window.__ksThemeColor){el.remove();var n=document.createElement('meta');n.name='theme-color';n.content=window.__ksThemeColor;document.head.appendChild(n);}var ic=document.querySelector('link[rel="icon"][type="image/svg+xml"]');if(ic&&ic.getAttribute('href')!==window.__ksFavicon){ic.setAttribute('href',window.__ksFavicon);}}).observe(document.head,{childList:true,subtree:true,attributes:true});}catch(e){}` }} />
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
