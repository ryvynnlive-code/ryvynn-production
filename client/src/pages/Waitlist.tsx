import { useState } from "react";
import WellnessDisclaimer from "@/components/WellnessDisclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_TITLE } from "@/const";
import { Flame, Mail, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const joinWaitlist = trpc.waitlist.join.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await joinWaitlist.mutateAsync({ email });
      
      if (result.success) {
        setSubmitted(true);
        toast.success(result.message || "You're on the list!");
      } else {
        toast.error(result.message || "Failed to join waitlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="container max-w-2xl">
          {!submitted ? (
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold gradient-text">
                  Join the Waitlist
                </h1>
                <p className="text-xl text-muted-foreground">
                  Be among the first to experience RYVYNN. Get early access, exclusive updates, 
                  and <strong className="text-foreground">+100 Soul Tokens</strong> when you join.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8"
                  >
                    {loading ? "Joining..." : "Join Waitlist"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  No spam. Just updates on launch and early access.
                </p>
              </form>

              <div className="pt-8 space-y-4">
                <h3 className="text-lg font-semibold">What You'll Get:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-primary" />
                    <span>Early access to RYVYNN before public launch</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-primary" />
                    <span>+100 Soul Tokens bonus (worth $10)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-primary" />
                    <span>Exclusive updates and behind-the-scenes content</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-primary" />
                    <span>Priority support and feature requests</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <CheckCircle className="w-24 h-24 text-primary" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold gradient-text">
                  You're In!
                </h1>
                <p className="text-xl text-muted-foreground">
                  Check your email for next steps. We'll notify you as soon as RYVYNN is ready.
                </p>
              </div>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8">
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
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
              <Link href="/privacy">
                <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
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
