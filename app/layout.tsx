import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import LayoutContent from '@/components/layout/LayoutContent';

const roboto = localFont({
  src: [
    {
      path: "../public/fonts/Roboto-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Medium.ttf", 
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Roboto-Bold.ttf", 
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
      path: "../public/fonts/Montserrat-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-montserrat", // Assign CSS variable for Montserrat
  display: "swap",
});

// --- Load Kalpurush Font (using TTF) ---
const kalpurush = localFont({
  src: "../public/fonts/kalpurush.ttf", 
  weight: "400", // Adjust if your Kalpurush.ttf has a different default weight
  style: "normal",
  variable: "--font-kalpurush", // Assign CSS variable for Kalpurush
  display: "swap",
});

export const metadata: Metadata = {
  title: "DUFS Blog - Film Publication",
  description: "A film blog created by Dhaka University Film Society.",
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
          kalpurush.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              <LayoutContent>{children}</LayoutContent>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
