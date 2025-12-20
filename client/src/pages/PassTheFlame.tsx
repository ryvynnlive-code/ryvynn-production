import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Flame, Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

/**
 * Pass the Flame - v1.40
 * Anonymous "send light" mechanic
 * No names, no logging, just symbolic light ritual
 */
export default function PassTheFlame() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [flameSent, setFlameSent] = useState(false);
  const [animating, setAnimating] = useState(false);

  const sendFlameMutation = trpc.flame.send.useMutation({
    onSuccess: (data: { success: boolean; tokensEarned: number }) => {
      setAnimating(true);
      setTimeout(() => {
        setFlameSent(true);
        setAnimating(false);
        toast.success(`+${data.tokensEarned} Soul Tokens earned`);
      }, 3000); // 3-second animation
    },
    onError: (error: any) => {
      toast.error("Failed to send flame. Please try again.");
      console.error(error);
    },
  });

  const handleSendFlame = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    sendFlameMutation.mutate();
  };

  const handleReset = () => {
    setFlameSent(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-primary glow" />
                <span className="text-xl font-bold gradient-text">Pass the Flame</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {!flameSent ? (
          /* Send Flame Interface */
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 glow-strong blur-2xl" />
                  <Flame 
                    className={`w-24 h-24 text-primary relative z-10 ${
                      animating ? "pulse-glow" : "breathe"
                    }`} 
                  />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Pass the <span className="gradient-text">Flame</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Send light to someone, somewhere, who needs it. Anonymous. Eternal. Sacred.
              </p>
            </div>

            <Card className="cyber-card">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-3">How it works</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      When you pass the flame, you send light to another soul in the RYVYNN community.
                    </p>
                    <p>
                      <strong className="text-foreground">No names.</strong> No messages. No tracking. Just pure intention.
                    </p>
                    <p>
                      The flame finds its way to someone who needs it most. They'll never know who sent it.
                      You'll never know who received it.
                    </p>
                    <p>
                      <strong className="text-foreground">That's the point.</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Earn <strong className="text-foreground">+5 Soul Tokens</strong> for each flame you pass</span>
                  </div>
                </div>

                <Button
                  onClick={handleSendFlame}
                  disabled={sendFlameMutation.isPending || animating}
                  className="w-full glow-strong text-lg py-6"
                  size="lg"
                >
                  {animating ? (
                    <>
                      <Flame className="mr-2 w-5 h-5 animate-pulse" />
                      Sending light...
                    </>
                  ) : sendFlameMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 w-5 h-5" />
                      Pass the Flame
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Ritual Explanation */}
            <Card className="bg-primary/5 border-primary/20">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">The Sacred Ritual</h3>
                <p className="text-sm text-muted-foreground">
                  In ancient traditions, passing light was a symbol of hope, connection, and continuity.
                  One flame lights another, and the light grows—never diminishing the source.
                </p>
                <p className="text-sm text-muted-foreground">
                  Here, we honor that tradition. Your light becomes someone else's beacon.
                  Their darkness becomes a little less dark. And you never need credit for it.
                </p>
              </div>
            </Card>
          </div>
        ) : (
          /* Flame Sent Confirmation */
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 glow-strong blur-2xl animate-pulse" />
                  <Flame className="w-24 h-24 text-primary relative z-10 breathe" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Your flame <span className="gradient-text">has been passed</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Somewhere, someone just received light. They don't know it came from you.
                That's exactly how it should be.
              </p>
            </div>

            <Card className="cyber-card text-center">
              <div className="space-y-4">
                <Sparkles className="w-12 h-12 text-primary mx-auto" />
                <p className="text-lg">
                  The light you give returns to you in ways unseen.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  "A candle loses nothing by lighting another candle."
                </p>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Pass Another Flame
              </Button>
              <Link href="/dashboard">
                <Button size="lg" className="flex-1 w-full">
                  Return to Sanctuary
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
