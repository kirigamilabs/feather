import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif} from "next/font/google";
import { AIProvider } from "@/components/AIProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Provider } from '@/components/Web3Provider';
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "KIRI/GAMI",
  description: "AI x Crypto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} min-h-screen bg-background text-foreground antialiased`}>
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AIProvider>
              {children}
            </AIProvider>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}