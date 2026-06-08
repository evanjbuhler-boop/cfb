import type { Metadata } from "next";
import { Bebas_Neue, Rajdhani, Space_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GRIDIRON DYNASTY",
  description: "The world's deepest college football simulator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${rajdhani.variable} ${spaceMono.variable} h-full`}>
      <body className="min-h-full font-[family-name:var(--font-body)]">{children}</body>
    </html>
  );
}
