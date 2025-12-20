import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles } from "lucide-react";

/**
 * AONIXX Voice Toggle - v1.40
 * Cosmic voice persona selection (feminine, masculine, neutral)
 * Affects: Truth Nuggets, Confession replies, Blessings, Rituals, Journal
 */

export type AONIXXVoice = "cosmic_feminine" | "cosmic_masculine" | "neutral";

interface AONIXXVoiceToggleProps {
  value: string;
  onChange: (value: AONIXXVoice) => void;
}

export default function AONIXXVoiceToggle({ value, onChange }: AONIXXVoiceToggleProps) {
  const voices = [
    {
      id: "cosmic_feminine" as AONIXXVoice,
      label: "Cosmic Feminine",
      description: "Nurturing, intuitive, flowing energy",
      example: "\"You are held in the gentle embrace of the universe...\"",
    },
    {
      id: "cosmic_masculine" as AONIXXVoice,
      label: "Cosmic Masculine",
      description: "Grounding, protective, steady presence",
      example: "\"Stand firm. You are stronger than you know...\"",
    },
    {
      id: "neutral" as AONIXXVoice,
      label: "Neutral / Androgynous",
      description: "Balanced, universal, transcendent",
      example: "\"The light within you knows the way forward...\"",
    },
  ];

  return (
    <Card className="cyber-card">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AONIXX Voice</h3>
            <p className="text-sm text-muted-foreground">
              Choose the cosmic voice that resonates with your soul
            </p>
          </div>
        </div>

        <RadioGroup
          value={value}
          onValueChange={(val) => onChange(val as AONIXXVoice)}
          className="space-y-3"
        >
          {voices.map((voice) => (
            <div
              key={voice.id}
              className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onChange(voice.id)}
            >
              <RadioGroupItem value={voice.id} id={voice.id} className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor={voice.id}
                  className="font-medium cursor-pointer"
                >
                  {voice.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {voice.description}
                </p>
                <p className="text-xs text-muted-foreground italic mt-2 opacity-70">
                  {voice.example}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            This voice will guide you through Truth Nuggets, Dual Flame responses, Blessings, Rituals, and Journal reflections.
          </p>
        </div>
      </div>
    </Card>
  );
}
