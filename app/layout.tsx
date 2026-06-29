import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import LayoutContent from "@/components/layout/LayoutContent";
import { LazyMotion, domAnimation } from "framer-motion";
import { SocialLinksProvider } from "@/contexts/SocialLinksContext";

const roboto = localFont({
  src: [
    {
      path: "../public/fonts/Roboto-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-roboto", // Assign CSS variable for Roboto
  display: "swap",
});

const montserrat = localFont({
  src: [
    {
      path: "../public/fonts/Montserrat-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-montserrat", // Assign CSS variable for Montserrat
  display: "swap",
});

const ZillaSlab = localFont({
  src: [
    {
      path: "../public/fonts/ZillaSlab-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ZillaSlab-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/ZillaSlab-Italic.woff2",
      weight: "400",
      style: "italic",
    }
  ],
  variable: "--font-zilla-slab",
  display: "swap",
});

const AlteHaasGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/AlteHaasGroteskRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/AlteHaasGroteskBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-alte-haas-grotesk",
  display: "swap",
});


const kalpurush = localFont({
  src: "../public/fonts/kalpurush.woff2",
  weight: "400", // Adjust if your Kalpurush.ttf has a different default weight
  style: "normal",
  variable: "--font-kalpurush", // Assign CSS variable for Kalpurush
  display: "swap",
});

const siteUrl = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DUFS Blog - Film Publication",
    template: "%s | DUFS Blog",
  },
  description: "A film blog created by Dhaka University Film Society.",
  applicationName: "DUFS Blog",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "DUFS Blog",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#231f20" },
    { media: "(prefers-color-scheme: dark)", color: "#231f20" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          roboto.variable,
          montserrat.variable,
          ZillaSlab.variable,
          AlteHaasGrotesk.variable,
          kalpurush.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SocialLinksProvider>
            <AuthProvider>
              <ToastProvider>
                <LayoutContent>
                  <LazyMotion features={domAnimation}>{children}</LazyMotion>
                </LayoutContent>
              </ToastProvider>
            </AuthProvider>
          </SocialLinksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
