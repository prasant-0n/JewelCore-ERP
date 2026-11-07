import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JewelCore ERP — Next-Gen Jewellery Enterprise Management",
  description:
    "Enterprise ERP for precious jewellery manufacturing, quality control, inventory, and retail.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian text-slate-100 min-h-screen antialiased selection:bg-gold/30 selection:text-gold-light">
        {children}
      </body>
    </html>
  );
}
