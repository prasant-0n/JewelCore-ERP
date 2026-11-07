import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/common/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "JewelCore ERP — Next-Gen Jewellery Enterprise Management",
  description:
    "Enterprise ERP for precious jewellery manufacturing, analytical quality control, inventory custody, and retail.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JewelCore Atelier",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "JewelCore ERP — Next-Gen Jewellery Enterprise Management",
    description:
      "Enterprise ERP for precious jewellery manufacturing, analytical quality control, inventory custody, and retail.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "JewelCore Luxury Atelier Group",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased selection:bg-gold/30 selection:text-gold-light">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <PwaRegister />
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
