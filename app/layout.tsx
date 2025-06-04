import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext"; // Add this import
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingBanner from "@/components/layout/FloatingBanner";

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
  description: "A film publication guiding film lovers.",
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
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <FloatingBanner />
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
