import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";
import { descripcionSitio as descripcion } from "@/lib/json-ld";
import { Analytics } from "@vercel/analytics/next";

const anton = localFont({
  src: "./fonts/Anton-Regular.woff2",
  weight: "400",
  variable: "--font-anton",
  display: "swap",
  fallback: ["Impact", "sans-serif"],
});

const dmSans = localFont({
  src: "./fonts/DMSans-Variable.woff2",
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.nombre} | ${site.bajada} en ${site.ciudad}`,
  description: descripcion,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: site.nombre,
    title: `${site.nombre} | ${site.bajada}`,
    description: descripcion,
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#120E0B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${anton.variable} ${dmSans.variable} antialiased`}>
      <body className="min-h-dvh bg-carbon text-masa">
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
