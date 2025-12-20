import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Moon, Sun, Heart } from "lucide-react";
import { useLocation } from "wouter";

const RITUALS = [
  {
    id: "dark-hour",
    title: "Dark Hour Ritual",
    description: "Breathing and grounding for your lowest moments. A 5-minute sanctuary when everything feels heavy.",
    icon: Moon,
    color: "from-indigo-600 to-purple-600",
    path: "/dark-hour",
  },
  {
    id: "flame-pass",
    title: "Flame Pass Ritual",
    description: "Share gratitude and positive affirmations. Pass light to another soul anonymously.",
    icon: Flame,
    color: "from-blue-500 to-cyan-500",
    path: "/flame",
  },
  {
    id: "bright-days",
    title: "Bright Days Reflection",
    description: "Celebrate your progress and wins. Acknowledge how far you've come from darkness to light.",
    icon: Sun,
    color: "from-yellow-500 to-orange-500",
    path: "/bright-days",
  },
];

export default function GuidedRituals() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Guided Rituals</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sacred practices to support you through every season. From your darkest hours to your brightest days.
          </p>
        </div>

        {/* Rituals Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {RITUALS.map((ritual) => {
            const Icon = ritual.icon;
            return (
              <Card
                key={ritual.id}
                className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-700 transition-all cursor-pointer group"
                onClick={() => setLocation(ritual.path)}
              >
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-br ${ritual.color} flex items-center justify-center`}>
                  <Icon className="w-16 h-16 text-white" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {ritual.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {ritual.description}
                  </p>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(ritual.path);
                    }}
                  >
                    Begin Ritual
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="bg-gray-900 border-gray-800 p-6 mt-12">
          <h3 className="text-lg font-semibold mb-3">About Rituals</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>
              <strong className="text-white">Rituals create sacred space</strong> in your daily life. 
              They're not religious—they're intentional practices that help you pause, breathe, and reconnect.
            </p>
            <p>
              Each ritual is designed to meet you where you are. Whether you're in crisis, feeling grateful, 
              or celebrating progress, there's a practice here for you.
            </p>
            <p>
              <strong className="text-white">Earn Soul Tokens</strong> for completing rituals. 
              More importantly, you're investing in your own wellbeing.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
