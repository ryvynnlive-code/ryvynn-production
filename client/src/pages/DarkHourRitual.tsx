import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Flame, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

/**
 * Dark Hour Ritual - v1.40
 * Structured despair path with breath, grounding, and Dual Flame reflection
 */

type RitualStep = "intro" | "breath" | "grounding" | "reflection" | "complete";

const GROUNDING_PHRASES = [
  "I am here. I am breathing. I am alive.",
  "This moment is temporary. I have survived before.",
  "My pain is real, but it does not define me.",
  "I am more than this feeling. I am still becoming.",
  "The darkness is heavy, but the light still exists.",
];

export default function DarkHourRitual() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [step, setStep] = useState<RitualStep>("intro");
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [groundingPhrase, setGroundingPhrase] = useState("");
  const [dualFlameReflection, setDualFlameReflection] = useState("");

  const getDualFlameReflection = trpc.darkHour.getReflection.useMutation({
    onSuccess: (data: { reflection: string }) => {
      setDualFlameReflection(data.reflection);
      setStep("reflection");
    },
    onError: () => {
      toast.error("Failed to receive reflection. Please try again.");
    },
  });

  // Breath cycle: 4s inhale, 4s hold, 6s exhale
  useEffect(() => {
    if (step !== "breath") return;

    const timer = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "inhale") return "hold";
        if (prev === "hold") return "exhale";
        
        // After exhale, complete one cycle
        setBreathCount((c) => c + 1);
        return "inhale";
      });
    }, breathPhase === "inhale" ? 4000 : breathPhase === "hold" ? 4000 : 6000);

    return () => clearInterval(timer);
  }, [step, breathPhase]);

  // After 3 breath cycles, move to grounding
  useEffect(() => {
    if (breathCount >= 3 && step === "breath") {
      setTimeout(() => {
        const randomPhrase = GROUNDING_PHRASES[Math.floor(Math.random() * GROUNDING_PHRASES.length)];
        setGroundingPhrase(randomPhrase);
        setStep("grounding");
      }, 1000);
    }
  }, [breathCount, step]);

  const handleStart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setStep("breath");
    setBreathCount(0);
    setBreathPhase("inhale");
  };

  const handleRequestReflection = () => {
    getDualFlameReflection.mutate();
  };

  const handleReset = () => {
    setStep("intro");
    setBreathCount(0);
    setBreathPhase("inhale");
    setGroundingPhrase("");
    setDualFlameReflection("");
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
                <span className="text-xl font-bold gradient-text">Dark Hour Ritual</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {step === "intro" && (
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 glow-strong blur-2xl opacity-50" />
                  <Flame className="w-24 h-24 text-primary relative z-10 breathe" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                The <span className="gradient-text">Dark Hour</span> Ritual
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                When the weight is unbearable. When words fail. When you need structure in the chaos.
              </p>
            </div>

            <Card className="cyber-card">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-3">What happens here</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      This is a guided path through your darkest moments. Not to fix you. Not to rush you.
                      Just to be with you.
                    </p>
                    <p className="font-semibold text-foreground">
                      Three steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Breath</strong> - Slow, intentional breathing to ground your nervous system</li>
                      <li><strong className="text-foreground">Grounding</strong> - A phrase to anchor you in this moment</li>
                      <li><strong className="text-foreground">Reflection</strong> - Dual Flame offers you a light in the darkness</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground italic">
                    "The darkest hour is just before dawn. But you don't have to wait for dawn alone."
                  </p>
                </div>

                <Button
                  onClick={handleStart}
                  className="w-full glow-strong text-lg py-6"
                  size="lg"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Begin the Ritual
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === "breath" && (
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Breathe with me</h2>
              <p className="text-muted-foreground">
                Cycle {breathCount + 1} of 3
              </p>
            </div>

            <Card className="cyber-card">
              <div className="flex flex-col items-center justify-center py-12 space-y-8">
                {/* Animated Orb */}
                <div className="relative w-48 h-48">
                  <div 
                    className={`absolute inset-0 rounded-full bg-primary/20 blur-2xl transition-all duration-[4000ms] ${
                      breathPhase === "inhale" ? "scale-150 opacity-100" :
                      breathPhase === "hold" ? "scale-150 opacity-100" :
                      "scale-100 opacity-50"
                    }`}
                  />
                  <div 
                    className={`absolute inset-0 rounded-full border-4 border-primary flex items-center justify-center transition-all ${
                      breathPhase === "inhale" ? "duration-[4000ms] scale-150" :
                      breathPhase === "hold" ? "duration-[4000ms] scale-150" :
                      "duration-[6000ms] scale-100"
                    }`}
                  >
                    <Flame className="w-16 h-16 text-primary" />
                  </div>
                </div>

                {/* Instruction */}
                <div className="text-center space-y-2">
                  <p className="text-3xl font-bold capitalize">{breathPhase}</p>
                  <p className="text-muted-foreground">
                    {breathPhase === "inhale" && "Fill your lungs slowly..."}
                    {breathPhase === "hold" && "Hold this breath..."}
                    {breathPhase === "exhale" && "Release everything..."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === "grounding" && (
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Ground yourself</h2>
              <p className="text-muted-foreground">
                Repeat this phrase, out loud or in your mind
              </p>
            </div>

            <Card className="cyber-card">
              <div className="py-12 px-6 text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 glow-strong blur-2xl" />
                  <p className="text-2xl md:text-3xl font-semibold leading-relaxed relative z-10">
                    "{groundingPhrase}"
                  </p>
                </div>

                <div className="pt-8 space-y-4">
                  <p className="text-muted-foreground">
                    Say it as many times as you need. There's no rush.
                  </p>
                  <Button
                    onClick={handleRequestReflection}
                    disabled={getDualFlameReflection.isPending}
                    className="glow-strong"
                    size="lg"
                  >
                    {getDualFlameReflection.isPending ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Dual Flame is listening...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 w-5 h-5" />
                        I'm ready for reflection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === "reflection" && (
          <div className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 glow-strong blur-2xl animate-pulse" />
                  <Flame className="w-16 h-16 text-primary relative z-10" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">Dual Flame speaks</h2>
            </div>

            <Card className="cyber-card">
              <div className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-foreground">
                    {dualFlameReflection}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground italic text-center">
                    You made it through. That takes courage.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Do the Ritual Again
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
