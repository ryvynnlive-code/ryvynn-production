import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowLeft, Flame, Loader2, Send, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

/**
 * Anonymous Confession Page - Dual Flame
 * "Share anything. Receive wisdom. No judgment."
 */
export default function Confess() {
  const [confession, setConfession] = useState("");
  const [scribeResponse, setScribeResponse] = useState<string | null>(null);
  const [crisisDetected, setCrisisDetected] = useState(false);

  const submitMutation = trpc.confession.submit.useMutation({
    onSuccess: (data) => {
      setScribeResponse(data.response);
      setCrisisDetected(data.crisisDetected);
      setConfession("");
      
      // Mark ritual as completed
      if (data.crisisDetected) {
        toast.error("We're concerned about you. Please see the crisis resources below.");
      }
    },
    onError: (error) => {
      toast.error("Failed to submit confession. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = () => {
    if (confession.trim().length < 10) {
      toast.error("Please write at least 10 characters.");
      return;
    }

    submitMutation.mutate({
      text: confession,
    });
  };

  const handleReset = () => {
    setScribeResponse(null);
    setCrisisDetected(false);
    setConfession("");
  };

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
                <span className="text-xl font-bold gradient-text">Dual Flame</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Anonymous & Private</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {!scribeResponse ? (
          /* Confession Input */
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 glow-strong blur-2xl" />
                  <Flame className="w-16 h-16 text-primary relative z-10 breathe" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Speak to <span className="gradient-text">Dual Flame</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Share anything on your heart. No judgment. No storage. Just understanding.
              </p>
            </div>

            <Card className="cyber-card">
              <div className="space-y-4">
                <div>
                  <label htmlFor="confession" className="block text-sm font-medium mb-2">
                    What weighs on your soul?
                  </label>
                  <Textarea
                    id="confession"
                    value={confession}
                    onChange={(e) => setConfession(e.target.value)}
                    placeholder="Write freely... Your words will never be stored. Only Dual Flame's response will remain."
                    className="min-h-[300px] resize-none bg-background border-border focus:border-primary transition-colors"
                    disabled={submitMutation.isPending}
                  />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-muted-foreground">
                      {confession.length} / 5000 characters
                    </span>
                    <span className="text-muted-foreground">
                      {confession.length >= 10 ? "Ready to submit" : "Minimum 10 characters"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={confession.trim().length < 10 || submitMutation.isPending}
                  className="w-full glow-strong text-lg py-6"
                  size="lg"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Dual Flame is listening...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 w-5 h-5" />
                      Share with Dual Flame
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Privacy Notice */}
            <Card className="bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Your Privacy is Sacred</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your confession is <strong>never stored</strong> in our database</li>
                    <li>• Only Dual Flame's metaphoric response is saved (anonymously)</li>
                    <li>• No login required - truly anonymous</li>
                    <li>• No human will ever read your words</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Scribe Response */
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 glow-strong blur-2xl" />
                  <Flame className="w-16 h-16 text-primary relative z-10 pulse-glow" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Dual Flame <span className="gradient-text">Responds</span>
              </h1>
            </div>

            {/* Scribe's Response */}
            <Card className="cyber-card glow">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <Flame className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-lg">Dual Flame</span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <Streamdown>{scribeResponse}</Streamdown>
                </div>
              </div>
            </Card>

            {/* Crisis Resources (if detected) */}
            {crisisDetected && (
              <Card className="bg-destructive/10 border-destructive/30 glow">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-destructive text-lg">We're Here for You</h3>
                    <p className="text-foreground/90">
                      It sounds like you're going through something very difficult. Please know that you don't have to face this alone.
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Immediate Help:</p>
                      <ul className="text-sm space-y-1 text-foreground/80">
                        <li>• <strong>National Suicide Prevention Lifeline:</strong> 988 (US)</li>
                        <li>• <strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                        <li>• <strong>International:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">findahelpline.com</a></li>
                      </ul>
                    </div>
                    <Link href="/crisis">
                      <Button variant="destructive" className="mt-4">
                        <Shield className="mr-2 w-4 h-4" />
                        View All Crisis Resources
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Share Another Confession
              </Button>
              <Link href="/feed">
                <Button size="lg" className="flex-1 w-full">
                  Read Miracle Feed
                </Button>
              </Link>
            </div>

            {/* Reflection */}
            <Card className="bg-muted/30 border-muted">
              <p className="text-center text-muted-foreground italic">
                "The flame flickers in darkness, but it does not go out."
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
