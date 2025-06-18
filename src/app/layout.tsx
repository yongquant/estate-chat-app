import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Real Estate Assistant - AI-Powered Property Guidance",
  description: "Get informed guidance on real estate matters through our AI-powered chat interface. Educational information only, not legal advice.",
  keywords: ["real estate", "property", "assistant", "AI", "chat", "legal guidance", "landlord", "tenant", "buying", "selling"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          expand={false}
          theme="light"
        />
      </body>
    </html>
  );
}
