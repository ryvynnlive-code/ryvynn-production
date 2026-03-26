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
import { VoiceJournalButton } from "@/components/VoiceJournalButton";
import { PushNotifications } from "@/components/PushNotifications";

export const metadata: Metadata = {
  metadataBase: new URL("https://ryvynn.live"),
  title: {
    default: "RYVYNN — From Our Darkest Hours to Our Brightest Days",
    template: "%s | RYVYNN",
  },
  description:
    "Anonymous AI-powered mental wellness. Zero surveillance. Face your shadows, find your light. Free crisis support, always.",
  robots: { index: true, follow: true },
  keywords: [
    "mental health AI",
    "anonymous therapy",
    "crisis support",
    "mental wellness",
    "privacy first mental health",
    "AI companion",
    "depression support",
    "anxiety help",
    "sobriety support",
    "free crisis line",
  ],
  openGraph: {
    type: "website",
    url: "https://ryvynn.live",
    siteName: "RYVYNN",
    title: "RYVYNN — From Our Darkest Hours to Our Brightest Days",
    description:
      "Anonymous AI mental wellness. Zero surveillance. Free crisis support forever. Your darkness has a path through it.",
    images: [
      {
        url: "/assets/dual-flame-logo.png",
        width: 512,
        height: 512,
        alt: "RYVYNN Dual Flame",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "RYVYNN — Anonymous AI Mental Wellness",
    description:
      "Zero surveillance. Free crisis support. Your darkness has a path through it.",
    images: ["/assets/dual-flame-logo.png"],
  },
  icons: {
    icon: "/assets/dual-flame-logo.png",
    apple: "/assets/dual-flame-logo.png",
  },
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
                    <VoiceJournalButton />
                    <PushNotifications />
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
// Build: 1773987439
