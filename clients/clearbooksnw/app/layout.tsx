import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clearbooks NW | Bookkeeping for IT & MSPs",
  description: "Bookkeeping built for IT & MSPs. 40 years of combined expertise in bookkeeping and IT solutions. We understand your technology.",
  keywords: ["bookkeeping", "IT", "MSP", "accounting", "tax preparation", "financial services"],
  openGraph: {
    title: "Clearbooks NW | Bookkeeping for IT & MSPs",
    description: "Bookkeeping built for IT & MSPs. We understand your technology.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-white text-navy-900">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
