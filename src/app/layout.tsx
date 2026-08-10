import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://consistentai.app"),
  title: {
    default: "Consistent AI — Character Studio",
    template: "%s | Consistent AI",
  },
  description:
    "AI-powered consistent character generation platform. Create characters with consistent faces, styles, and poses across every image.",
  openGraph: {
    title: "Consistent AI — Character Studio",
    description:
      "AI-powered consistent character generation platform. Create characters with consistent faces, styles, and poses across every image.",
    type: "website",
    siteName: "Consistent AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Consistent AI — Character Studio",
    description: "AI-powered consistent character generation platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        inter.variable,
        geistMono.variable,
      )}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) || localStorage.getItem('theme') === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (_) {}
            `,
          }} />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
