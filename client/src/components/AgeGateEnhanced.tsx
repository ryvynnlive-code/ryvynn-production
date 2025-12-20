import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AgeGateEnhanced({ onVerified }: { onVerified: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [ageTier, setAgeTier] = useState<"13-17" | "18-24" | "25-44" | "45-64" | "65+" | null>(null);
  
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      localStorage.setItem("ryvynn_age_verified", "true");
      onVerified();
    },
    onError: (error) => {
      toast.error("Failed to save age tier: " + error.message);
    },
  });

  const handleVerify = () => {
    if (!ageTier) {
      toast.error("Please select your age range");
      return;
    }
    
    // Save age tier to database
    updateProfile.mutate({ ageTier });
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-6">
      <Card className="max-w-2xl w-full bg-gray-900 border-blue-500/30 p-8">
        <div className="flex flex-col items-center space-y-6">
          <Flame className="w-16 h-16 text-blue-500" />
          <h1 className="text-3xl font-bold text-white text-center">
            RYVYNN
          </h1>
          <p className="text-gray-400 text-center text-lg">
            From our darkest hours to our brightest days
          </p>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4 w-full">
            <h2 className="text-xl font-semibold text-white">
              Age Verification & Wellness Disclaimer
            </h2>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>
                <strong className="text-white">You must be 18 years or older to use RYVYNN.</strong>
              </p>
              <p>
                <strong className="text-white">RYVYNN is a wellness AI, not a medical or mental-health provider.</strong>
                {" "}We do not diagnose, treat, or replace licensed counselors, therapists, or physicians.
              </p>
              <p>
                <strong className="text-white">If you are in crisis,</strong> please contact your local emergency services or call/text{" "}
                <strong className="text-blue-500">988</strong> in the United States.
              </p>
              <p>
                By continuing, you acknowledge that you are 18+ and understand that RYVYNN provides wellness support, not medical treatment.
              </p>
            </div>
          </div>

          {/* Age Tier Selection */}
          <div className="w-full space-y-3">
            <label className="text-sm font-medium text-white">Select your age range (helps personalize content):</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "18-24", label: "18-24" },
                { value: "25-44", label: "25-44" },
                { value: "45-64", label: "45-64" },
                { value: "65+", label: "65+" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAgeTier(option.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    ageTier === option.value
                      ? "border-blue-500 bg-blue-500/20 text-white"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer w-full">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-white text-sm">
              I am 18+ and I understand this is a wellness service, not medical care
            </span>
          </label>

          <Button
            onClick={handleVerify}
            disabled={!agreed || !ageTier || updateProfile.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg disabled:opacity-50"
          >
            {updateProfile.isPending ? "Saving..." : "Enter Your Sanctuary"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
