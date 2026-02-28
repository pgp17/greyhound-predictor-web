import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://greyhound-predictor.com'),
  title: {
    default: "Greyhound Predictor | Pro Dog Racing Tips & Analytics",
    template: "%s | Greyhound Predictor"
  },
  description: "Advanced Greyhound Predictor mathematically analyzing form, speed, and track biases. Access daily free tips, live race cards, and professional analysis tools.",
  keywords: ["greyhound racing", "greyhound predictor", "dog racing tips", "greyhound predictions", "racing stats", "greyhound form", "free greyhound tips", "UK greyhound racing", "Timeform greyhounds"],
  authors: [{ name: "Greyhound Predictor Team" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://greyhound-predictor.com",
    siteName: "Greyhound Predictor",
    title: "Greyhound Predictor | Pro Dog Racing Tips",
    description: "Advanced Greyhound Predictor. Daily free tips, live race cards, and professional analysis.",
    images: [
      {
        url: "/og-image.jpg", // Placeholder for future graphic
        width: 1200,
        height: 630,
        alt: "Greyhound Predictor AI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Greyhound Predictor | Pro Dog Racing Tips",
    description: "Advanced Greyhound Predictor. Daily free tips, live race cards, and professional analysis.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: "YOUR_GOOGLE_VERIFICATION_CODE", // We will add this later when they setup Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0E17] text-slate-200 min-h-screen selection:bg-indigo-500/30 flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/5 bg-[#0D131F] py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-4">
            <div className="text-xl font-bold font-heading tracking-wider">
              <span className="text-white">GREYHOUND</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">PREDICTOR</span>
            </div>
            <p className="text-slate-400 text-sm">Professional Greyhound Racing Analysis</p>
            <a href="mailto:contact@greyhound-predictor.com" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">
              contact@greyhound-predictor.com
            </a>
            <p className="text-slate-600 text-xs pt-4">© {new Date().getFullYear()} GreyhoundPredictor. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
