import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/contexts/I18nContext";
import { PersonaProvider } from "@/contexts/PersonaContext";
import { AgeTierProvider } from "@/contexts/AgeTierContext";
import { GeolocationProvider } from "@/contexts/GeolocationContext";
import { SoulTokenProvider } from "@/contexts/SoulTokenContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { VoiceJournalButton } from "@/components/VoiceJournalButton";
import { PushNotifications } from "@/components/PushNotifications";

// CrisisBanner removed from global layout.
// A red "🆘 In Crisis? Call 988" bar as the FIRST thing on every page
// raises anxiety before a single word of support is offered.
// Crisis routing lives inline in the Guardian page and crisis page only.
//
// AgeGate removed from global layout.
// Compliance note lives in page footer text only.

export const metadata: Metadata = {
  metadataBase: new URL("https://ryvynn.live"),
  title: {
    default: "RYVYNN — You're not alone right now.",
    template: "%s | RYVYNN",
  },
  description:
    "Say what's on your mind. Anonymous by default — no real name, no surveillance. Free to start. Crisis support always free.",
  robots: { index: true, follow: true },
  keywords: [
    "anonymous mental health",
    "private AI support",
    "no login therapy",
    "crisis support free",
    "mental wellness anonymous",
    "zero surveillance AI",
    "anxiety help",
    "depression support anonymous",
    "free crisis line",
    "emotional support AI",
  ],
  openGraph: {
    type: "website",
    url: "https://ryvynn.live",
    siteName: "RYVYNN",
    title: "RYVYNN — You're not alone right now.",
    description:
      "Say what's on your mind. Anonymous by default — no real name, no surveillance. Free to start.",
    images: [{ url: "/assets/dual-flame-logo.png", width: 512, height: 512, alt: "RYVYNN" }],
  },
  twitter: {
    card: "summary",
    title: "RYVYNN — Anonymous AI support that forgets on purpose.",
    description: "Anonymous by default. No surveillance. Just say what you need to say.",
    images: ["/assets/dual-flame-logo.png"],
  },
  icons: {
    icon: "/assets/dual-flame-logo.png",
    apple: "/assets/dual-flame-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <AuthProvider>
          <I18nProvider>
            <PersonaProvider>
              <AgeTierProvider>
                <GeolocationProvider>
                  <SoulTokenProvider>
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
