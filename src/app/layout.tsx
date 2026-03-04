import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://greyhound-predictor.com'),
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
        url: "/og-image.jpg",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-[#111318] text-[#e2e4e8] min-h-screen flex flex-col"
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#0e1016] py-8 mt-16">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#c9a84c] rounded flex items-center justify-center">
                <span className="text-[#111318] font-extrabold text-[10px]">G</span>
              </div>
              <span className="text-sm font-semibold text-white/60 tracking-wide">
                GREYHOUND PREDICTOR
              </span>
            </div>
            <p className="text-white/25 text-xs">Professional Greyhound Racing Analysis</p>
            <a href="mailto:contact@greyhound-predictor.com" className="text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors text-xs font-medium">
              contact@greyhound-predictor.com
            </a>
            <p className="text-white/15 text-[11px] pt-2">© {new Date().getFullYear()} GreyhoundPredictor. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
