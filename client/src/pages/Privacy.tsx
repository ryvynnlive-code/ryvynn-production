import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { APP_TITLE } from "@/const";
import { Flame } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="glow">
                  <Flame className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold gradient-text">{APP_TITLE}</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20">
        <div className="container max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold gradient-text">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              Effective Date: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container max-w-4xl space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">1. Introduction</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RYVYNN ("we," "us," or "our") is operated by NEXXT GEN INNOVATIONS LLC (d/b/a AONIXX). 
              This Privacy Policy explains how we collect, use, and protect your personal information when 
              you use our wellness AI platform.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Core Principle:</strong> We log as little as possible. 
              Your privacy is sacred, not a commodity.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">2. Information We Collect</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We collect only what is necessary to provide the service:
            </p>
            <ul className="space-y-3 text-lg text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Account Information:</strong> Email address, name (optional), login method</li>
              <li><strong className="text-foreground">Profile Settings:</strong> Voice tone, avatar theme, age tier, region (for crisis resources)</li>
              <li><strong className="text-foreground">Soul Tokens Balance:</strong> Your token count and transaction history</li>
              <li><strong className="text-foreground">Usage Data:</strong> Login timestamps, feature usage (aggregated, anonymized)</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">3. What We Do NOT Collect</h2>
            <ul className="space-y-3 text-lg text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Confessions:</strong> Never stored. Processed in real-time and immediately discarded.</li>
              <li><strong className="text-foreground">Journal Entries:</strong> Encrypted and stored locally on your device, never on our servers.</li>
              <li><strong className="text-foreground">Browsing History:</strong> We do not track your behavior across the web.</li>
              <li><strong className="text-foreground">Device Fingerprints:</strong> We do not collect device-specific identifiers.</li>
              <li><strong className="text-foreground">Third-Party Cookies:</strong> We do not use advertising or tracking cookies.</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">4. How We Use Your Information</h2>
            <ul className="space-y-3 text-lg text-muted-foreground list-disc list-inside">
              <li>To provide and improve the RYVYNN service</li>
              <li>To personalize AI responses based on your voice tone and avatar settings</li>
              <li>To manage your Soul Tokens balance and subscriptions</li>
              <li>To send critical service updates (opt-out available for non-essential emails)</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">5. Data Sharing</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong className="text-foreground">We do not sell your data. Ever.</strong>
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We may share data only in these limited circumstances:
            </p>
            <ul className="space-y-3 text-lg text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Service Providers:</strong> Anthropic (AI), Stripe (payments), TiDB (database hosting)—all under strict data protection agreements</li>
              <li><strong className="text-foreground">Legal Compliance:</strong> If required by law or to protect safety (e.g., imminent harm)</li>
              <li><strong className="text-foreground">Business Transfer:</strong> If AONIXX is acquired, your data may transfer (you will be notified)</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">6. Data Security</h2>
            <ul className="space-y-3 text-lg text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Encryption in Transit:</strong> TLS 1.3</li>
              <li><strong className="text-foreground">Encryption at Rest:</strong> AES-256</li>
              <li><strong className="text-foreground">Access Controls:</strong> Role-based access, multi-factor authentication for team members</li>
              <li><strong className="text-foreground">Regular Audits:</strong> Security reviews and penetration testing</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">7. Your Rights</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="space-y-3 text-lg text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Access:</strong> Request a copy of your data</li>
              <li><strong className="text-foreground">Correction:</strong> Update inaccurate information</li>
              <li><strong className="text-foreground">Deletion:</strong> Delete your account and all associated data</li>
              <li><strong className="text-foreground">Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong className="text-foreground">Opt-Out:</strong> Unsubscribe from non-essential emails</li>
            </ul>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To exercise these rights, contact us at <a href="mailto:privacy@aonixx.com" className="text-primary hover:underline">privacy@aonixx.com</a>.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">8. Children's Privacy</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RYVYNN is not intended for users under 18. We do not knowingly collect data from minors. 
              If we discover that a minor has created an account, we will delete it immediately.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">9. Changes to This Policy</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. If we make material changes, we will 
              notify you via email or in-app notification at least 30 days before the changes take effect. 
              Continued use of RYVYNN after changes constitutes acceptance.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">10. Contact Us</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              For questions about this Privacy Policy, contact:
            </p>
            <p className="text-lg text-muted-foreground">
              <strong className="text-foreground">NEXXT GEN INNOVATIONS LLC (d/b/a AONIXX)</strong><br />
              Email: <a href="mailto:privacy@aonixx.com" className="text-primary hover:underline">privacy@aonixx.com</a><br />
              Address: [To be added]
            </p>
          </div>
        </div>
      </section>

      {/* Wellness Disclaimer */}
      <WellnessDisclaimer />

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">{APP_TITLE}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/origin">
                <span className="hover:text-foreground transition-colors cursor-pointer">Origin</span>
              </Link>
              <Link href="/manifesto">
                <span className="hover:text-foreground transition-colors cursor-pointer">Manifesto</span>
              </Link>
              <Link href="/trust">
                <span className="hover:text-foreground transition-colors cursor-pointer">Trust</span>
              </Link>
              <Link href="/investors">
                <span className="hover:text-foreground transition-colors cursor-pointer">Investors</span>
              </Link>
            </div>

            <div className="text-sm text-muted-foreground">
              © 2025 {APP_TITLE}. Built with care.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
