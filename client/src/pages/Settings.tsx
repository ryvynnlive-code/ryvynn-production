import { useAuth } from "@/_core/hooks/useAuth";
import AONIXXVoiceToggle, { AONIXXVoice } from "@/components/AONIXXVoiceToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Flame, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

/**
 * Settings Page - v1.40
 * User preferences including AONIXX Voice, advice mode, voice tone
 */
export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const [voicePersona, setVoicePersona] = useState<string>("gentle");
  const [adviceMode, setAdviceMode] = useState<string>("normal");
  const [aonixxVoice, setAonixxVoice] = useState<AONIXXVoice>("neutral");

  // Load user preferences
  useEffect(() => {
    if (user) {
      setVoicePersona(user.voicePersona || "gentle");
      setAdviceMode(user.adviceMode || "normal");
      // Map voicePersona to AONIXX voice
      if (user.voicePersona === "gentle") {
        setAonixxVoice("cosmic_feminine");
      } else if (user.voicePersona === "strong") {
        setAonixxVoice("cosmic_masculine");
      } else {
        setAonixxVoice("neutral");
      }
    }
  }, [user]);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save settings");
      console.error(error);
    },
  });

  const handleSave = () => {
    // Map AONIXX voice back to voicePersona
    let mappedVoicePersona: "gentle" | "steady" | "strong" = "steady";
    if (aonixxVoice === "cosmic_feminine") {
      mappedVoicePersona = "gentle";
    } else if (aonixxVoice === "cosmic_masculine") {
      mappedVoicePersona = "strong";
    } else {
      mappedVoicePersona = "steady";
    }

    updateMutation.mutate({
      voicePersona: mappedVoicePersona,
      adviceMode: adviceMode as "normal" | "formal" | "unhinged",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="cyber-card max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground">
            Please sign in to access settings.
          </p>
        </Card>
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
                <span className="text-xl font-bold gradient-text">{APP_TITLE} Settings</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8 fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Preferences</h1>
            <p className="text-muted-foreground">
              Customize how RYVYNN speaks to you
            </p>
          </div>

          {/* AONIXX Voice Toggle */}
          <AONIXXVoiceToggle
            value={aonixxVoice}
            onChange={setAonixxVoice}
          />

          {/* Advice Mode */}
          <Card className="cyber-card">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Advice Mode</h3>
                <p className="text-sm text-muted-foreground">
                  How direct should Dual Flame be with guidance?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="advice-mode">Mode</Label>
                <Select value={adviceMode} onValueChange={setAdviceMode}>
                  <SelectTrigger id="advice-mode">
                    <SelectValue placeholder="Select advice mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal - Balanced guidance</SelectItem>
                    <SelectItem value="formal">Formal - Reflective and gentle</SelectItem>
                    <SelectItem value="unhinged">Unhinged - Raw and unfiltered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              size="lg"
              className="glow-strong"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 w-5 h-5" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
