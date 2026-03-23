import { Cormorant_Garamond, Manrope, Caveat } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["italic", "normal"],
  display: "swap",
  preload: false,
});

const cursive = Caveat({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["500", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Katha",
  description: "Turn conversations into cinematic memoirs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${cursive.variable}`}>
      <body className="antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
