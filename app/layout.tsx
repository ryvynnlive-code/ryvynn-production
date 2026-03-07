import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/contexts/I18nContext";
import { CrisisBanner } from "@/components/CrisisBanner";
import { LanguageToggle } from "@/components/LanguageToggle";

export const metadata: Metadata = {
  title: "RYVYNN - From Our Darkest Hours to Our Brightest Days",
  description: "Anonymous AI-powered mental wellness. Zero surveillance. Face your shadows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <I18nProvider>
          <CrisisBanner />
          <nav className="border-b border-gray-800 py-4 px-6">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥🔥</span>
                <span className="font-bold text-xl">RYVYNN</span>
              </div>
              <LanguageToggle />
            </div>
          </nav>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
