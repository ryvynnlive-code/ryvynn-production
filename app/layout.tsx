import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/contexts/I18nContext";
import { PersonaProvider } from "@/contexts/PersonaContext";
import { AgeTierProvider } from "@/contexts/AgeTierContext";
import { GeolocationProvider } from "@/contexts/GeolocationContext";
import { SoulTokenProvider } from "@/contexts/SoulTokenContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CrisisBanner } from "@/components/CrisisBanner";
import { Navigation } from "@/components/Navigation";
import { AgeGate } from "@/components/persona/AgeGate";

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
        <AuthProvider>
          <I18nProvider>
            <PersonaProvider>
              <AgeTierProvider>
                <GeolocationProvider>
                  <SoulTokenProvider>
                    <AgeGate />
                    <CrisisBanner />
                    <Navigation />
                    {children}
                  </SoulTokenProvider>
                </GeolocationProvider>
              </AgeTierProvider>
            </PersonaProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
