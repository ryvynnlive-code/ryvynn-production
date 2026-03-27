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
import { VoiceJournalButton } from "@/components/VoiceJournalButton";
import { PushNotifications } from "@/components/PushNotifications";

// AgeGate intentionally removed from layout.
// Compliance note lives in page footer only.
// A blocking gate as first screen kills conversion for users in distress.

export const metadata: Metadata = {
  metadataBase: new URL("https://ryvynn.live"),
  title: {
    default: "RYVYNN — Say what's on your mind. It disappears when you leave.",
    template: "%s | RYVYNN",
  },
  description:
    "Anonymous AI support. No login, no memory, no tracking. Say what you need to say — it vanishes when you close the tab. Free. Always.",
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
      "Say what's on your mind. No account. No memory. No one watching. It disappears when you leave.",
    images: [
      {
        url: "/assets/dual-flame-logo.png",
        width: 512,
        height: 512,
        alt: "RYVYNN",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "RYVYNN — Anonymous AI support that forgets on purpose.",
    description:
      "No login. No memory. No tracking. Just say what you need to say.",
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
