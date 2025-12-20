import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Flame, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

/**
 * Daily Rituals Page
 * "Start your day with wisdom and grounding"
 */
export default function Rituals() {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  const utils = trpc.useUtils();

  // Fetch today's ritual status
  const { data: ritualData, isLoading: ritualLoading } = trpc.rituals.getToday.useQuery();

  // Fetch daily truth
  const { data: truthData, isLoading: truthLoading } = trpc.rituals.getDailyTruth.useQuery();

  // Fetch daily blessing
  const { data: blessingData, isLoading: blessingLoading } = trpc.rituals.getDailyBlessing.useQuery();

  // Complete ritual mutation
  const completeMutation = trpc.rituals.complete.useMutation({
    onSuccess: (data) => {
      if (data.tokensAwarded > 0) {
        toast.success(`+${data.tokensAwarded} Soul Tokens earned!`);
      }
      utils.rituals.getToday.invalidate();
      utils.soulTokens.getBalance.invalidate();
    },
  });

  const handleComplete = (ritual: string) => {
    completeMutation.mutate({ ritual: ritual as any });
  };

  // Breathing exercise
  const startBreathing = () => {
    setShowBreathing(true);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    let phase: "inhale" | "hold" | "exhale" = "inhale";
    setBreathingPhase("inhale");

    const cycle = () => {
      setTimeout(() => {
        phase = "hold";
        setBreathingPhase("hold");

        setTimeout(() => {
          phase = "exhale";
          setBreathingPhase("exhale");

          setTimeout(() => {
            phase = "inhale";
            setBreathingPhase("inhale");
            cycle(); // Continue cycling
          }, 4000);
        }, 4000);
      }, 4000);
    };

    cycle();
  };

  const ritual = ritualData?.ritual;
  const streak = ritualData?.streak || 0;

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
                <Sparkles className="w-6 h-6 text-accent glow" />
                <span className="text-xl font-bold gradient-text">Daily Rituals</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Streak:</span>
              <span className="font-semibold text-foreground">{streak} days</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center space-y-4 mb-12 fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 glow-strong blur-2xl" />
              <Sparkles className="w-16 h-16 text-accent relative z-10 breathe" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Today's <span className="gradient-text">Rituals</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Ground yourself. Find peace. Begin your day with intention.
          </p>
        </div>

        {ritualLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Daily Truth */}
            <Card className="cyber-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">Daily Truth</h3>
                  </div>

                  {truthLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <Streamdown>{truthData?.truth || "Loading your truth..."}</Streamdown>
                    </div>
                  )}
                </div>

                {ritual?.dailyTruthViewed ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Check className="w-5 h-5" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleComplete("dailyTruthViewed")}
                    disabled={completeMutation.isPending}
                    size="sm"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </Card>

            {/* Daily Blessing */}
            {blessingData?.blessing && (
              <Card className="cyber-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Sparkles className="w-6 h-6 text-secondary" />
                      </div>
                      <h3 className="text-2xl font-semibold">Daily Blessing</h3>
                    </div>

                    {blessingLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        <Streamdown>{blessingData.blessing}</Streamdown>
                      </div>
                    )}
                  </div>

                  {ritual?.dailyBlessingViewed ? (
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Check className="w-5 h-5" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleComplete("dailyBlessingViewed")}
                      disabled={completeMutation.isPending}
                      size="sm"
                      variant="secondary"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Breathing Exercise */}
            <Card className="cyber-card">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Flame className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold">Breathing Exercise</h3>
                  {ritual?.breathingExerciseCompleted && (
                    <div className="flex items-center gap-2 text-sm text-accent ml-auto">
                      <Check className="w-5 h-5" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground">
                  Take a moment to ground yourself with a simple breathing exercise.
                  Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds.
                </p>

                {!showBreathing ? (
                  <Button
                    onClick={startBreathing}
                    className="w-full"
                    size="lg"
                  >
                    Start Breathing Exercise
                  </Button>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-[4000ms] ${
                          breathingPhase === "inhale"
                            ? "scale-150 bg-accent/30"
                            : breathingPhase === "hold"
                            ? "scale-150 bg-accent/30"
                            : "scale-100 bg-accent/10"
                        }`}
                      >
                        <Flame className="w-16 h-16 text-accent" />
                      </div>
                      <p className="text-2xl font-semibold mt-8 capitalize">
                        {breathingPhase}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowBreathing(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Stop
                      </Button>
                      {!ritual?.breathingExerciseCompleted && (
                        <Button
                          onClick={() => {
                            handleComplete("breathingExerciseCompleted");
                            setShowBreathing(false);
                          }}
                          disabled={completeMutation.isPending}
                          className="flex-1"
                        >
                          Complete Exercise
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/confess">
                <Card className="cyber-card cursor-pointer group h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:glow transition-all">
                        <Flame className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Confess</h4>
                        <p className="text-sm text-muted-foreground">Share with Dual Flame</p>
                      </div>
                    </div>
                    {ritual?.confessionCompleted && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </Card>
              </Link>

              <Link href="/journal">
                <Card className="cyber-card cursor-pointer group h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg group-hover:glow transition-all">
                        <Sparkles className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Journal</h4>
                        <p className="text-sm text-muted-foreground">Write privately</p>
                      </div>
                    </div>
                    {ritual?.journalEntryCompleted && (
                      <Check className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                </Card>
              </Link>
            </div>

            {/* Progress Summary */}
            <Card className="cyber-card bg-primary/5 border-primary/20">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Tokens earned today</p>
                <p className="text-4xl font-bold text-primary">{ritual?.tokensEarnedToday || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Keep going! Every ritual brings you closer to your brightest days.
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
