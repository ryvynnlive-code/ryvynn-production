import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Sparkles, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function BrightDaysReflection() {
  const [step, setStep] = useState(1);
  const [wins, setWins] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [progress, setProgress] = useState("");

  const completeRitual = trpc.rituals.complete.useMutation({
    onSuccess: (data) => {
      toast.success(`Ritual complete! +${data.tokensAwarded} Soul Tokens earned`);
      setTimeout(() => {
        window.location.href = "/rituals";
      }, 2000);
    },
  });

  const handleComplete = () => {
    completeRitual.mutate({
      ritual: "journalEntryCompleted",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900/20 via-black to-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Sun className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Bright Days Reflection</h1>
          <p className="text-gray-400">Celebrate your progress and acknowledge your light</p>
        </div>

        {step === 1 && (
          <Card className="bg-gray-900 border-yellow-700/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-yellow-500" />
              <h2 className="text-xl font-bold">Recent Wins</h2>
            </div>
            <p className="text-gray-400 mb-4">
              What are 3 things you've accomplished recently? Big or small—they all matter.
            </p>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="1. Got out of bed when it was hard&#10;2. Reached out to a friend&#10;3. Took care of myself today"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
              rows={6}
            />
            <Button
              onClick={() => setStep(2)}
              disabled={!wins.trim()}
              className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Continue
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-gray-900 border-yellow-700/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h2 className="text-xl font-bold">Gratitude</h2>
            </div>
            <p className="text-gray-400 mb-4">
              What are you grateful for today? Who or what brought you light?
            </p>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="I'm grateful for..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
              rows={6}
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!gratitude.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-gray-900 border-yellow-700/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sun className="w-8 h-8 text-yellow-500" />
              <h2 className="text-xl font-bold">Progress Reflection</h2>
            </div>
            <p className="text-gray-400 mb-4">
              How far have you come? Reflect on your journey from darkness to light.
            </p>
            <textarea
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="I used to... but now I..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
              rows={6}
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!progress.trim() || completeRitual.isPending}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {completeRitual.isPending ? "Saving..." : "Complete Ritual"}
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                s === step ? "bg-yellow-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
