import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReadNest — Curated Digital Library & Book Borrowing",
  description:
    "Discover, explore, and borrow books across Story, Tech, and Science with ReadNest digital library platform.",
  keywords: ["library", "books", "borrowing", "reading", "stories", "tech", "science"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#FAF8F5] text-[#1D2622]"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: "0.75rem",
              fontFamily: "var(--font-jakarta)",
            },
          }}
        />
      </body>
    </html>
  );
}
