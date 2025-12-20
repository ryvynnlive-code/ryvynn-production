import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Smile, Meh, Frown, Heart, Flame } from "lucide-react";
import { toast } from "sonner";

const MOOD_OPTIONS = [
  { value: "very_good", label: "Great", icon: Smile, color: "text-green-500" },
  { value: "good", label: "Good", icon: Heart, color: "text-blue-500" },
  { value: "neutral", label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: "low", label: "Low", icon: Frown, color: "text-orange-500" },
  { value: "very_low", label: "Struggling", icon: Frown, color: "text-red-500" },
];

export default function MoodCheckIn() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMood = trpc.mood.checkIn.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Mood check-in saved! +5 Soul Tokens earned");
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMood(null);
        setJournalEntry("");
      }, 3000);
    },
    onError: (error) => {
      toast.error("Failed to save mood: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    submitMood.mutate({
      mood: selectedMood as any,
      note: journalEntry || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-gray-900 border-blue-500/30 p-8 text-center">
          <Flame className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You</h2>
          <p className="text-gray-400">
            Your check-in has been saved. Remember, every moment of awareness is a step toward light.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Flame className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Mood Check-In</h1>
          <p className="text-gray-400">How are you feeling right now?</p>
        </div>

        {/* Mood Selection */}
        <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select your mood</h2>
          <div className="grid grid-cols-5 gap-3">
            {MOOD_OPTIONS.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <Icon className={`w-8 h-8 ${isSelected ? "text-blue-500" : mood.color}`} />
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Optional Journal Entry */}
        <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">What's on your mind? (Optional)</h2>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Share what you're feeling, thinking, or experiencing..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            rows={6}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-2">{journalEntry.length}/1000 characters</p>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || submitMood.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg disabled:opacity-50"
        >
          {submitMood.isPending ? "Saving..." : "Complete Check-In"}
        </Button>

        {/* Encouragement */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Checking in daily helps you track patterns and celebrate progress. +5 Soul Tokens per check-in.
        </p>
      </div>
    </div>
  );
}
