import { Card } from "@/components/ui/card";
import { Flame, Sparkles } from "lucide-react";

/**
 * 9-Panel Origin Scroll - v1.40
 * Visual sacred-tech journey through RYVYNN's origin story
 */

interface Panel {
  id: number;
  title: string;
  description: string;
  symbol: string;
}

const PANELS: Panel[] = [
  {
    id: 1,
    title: "Darkness",
    description: "The weight of isolation. The silence that screams. The moment when everything feels impossible.",
    symbol: "●",
  },
  {
    id: 2,
    title: "Isolation",
    description: "Alone in the void. No one understands. The world moves on while you're frozen.",
    symbol: "○",
  },
  {
    id: 3,
    title: "Spark",
    description: "A flicker. Barely visible. The smallest thought: 'Maybe I can survive this.'",
    symbol: "✦",
  },
  {
    id: 4,
    title: "Voice",
    description: "Someone speaks. Not to fix you. Just to be with you. 'I see you. You're not alone.'",
    symbol: "◈",
  },
  {
    id: 5,
    title: "Rising",
    description: "One breath. Then another. Small steps. The weight is still there, but you're moving.",
    symbol: "△",
  },
  {
    id: 6,
    title: "Breakthrough",
    description: "The moment you realize: I am more than my pain. I am still becoming.",
    symbol: "◇",
  },
  {
    id: 7,
    title: "Light Fracture",
    description: "The light doesn't come all at once. It breaks through in pieces. And that's enough.",
    symbol: "◆",
  },
  {
    id: 8,
    title: "Alignment",
    description: "You find your rhythm. Not perfect. Not healed. But aligned with your truth.",
    symbol: "⬡",
  },
  {
    id: 9,
    title: "Becoming",
    description: "The journey never ends. You are always becoming. And that is the sacred work.",
    symbol: "✧",
  },
];

export default function OriginScroll() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 fade-in">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 glow-strong blur-2xl" />
            <Flame className="w-16 h-16 text-primary relative z-10 breathe" />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold">
          The <span className="gradient-text">Origin Scroll</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Every journey through darkness follows a sacred path. This is yours.
        </p>
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-3 gap-6">
        {PANELS.map((panel, index) => (
          <Card
            key={panel.id}
            className="cyber-card group cursor-default"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="space-y-4">
              {/* Symbol */}
              <div className="flex items-center justify-between">
                <div className="text-5xl text-primary/50 font-light group-hover:text-primary transition-colors">
                  {panel.symbol}
                </div>
                <div className="text-sm text-muted-foreground">
                  {panel.id}/9
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold">{panel.title}</h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {panel.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Card className="bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="text-foreground leading-relaxed">
              This scroll is not linear. You may move through these stages in any order.
              You may revisit them. You may skip some entirely.
            </p>
            <p className="text-foreground leading-relaxed mt-3">
              <strong>There is no wrong way to heal.</strong>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
