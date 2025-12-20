import { Shield, Eye, Cookie, Database, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Zero-Surveillance Seal - v1.40
 * On-screen proof of privacy commitments
 */
export default function ZeroSurveillanceSeal() {
  const guarantees = [
    {
      icon: Eye,
      title: "Zero Tracking",
      description: "We don't track your behavior",
    },
    {
      icon: Cookie,
      title: "No Cookies",
      description: "Only essential session cookies",
    },
    {
      icon: Database,
      title: "Ephemeral Storage",
      description: "Confessions never stored",
    },
    {
      icon: Share2,
      title: "No Sharing",
      description: "Your data stays with you",
    },
  ];

  return (
    <Card className="bg-primary/5 border-primary/20 p-6">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 glow-strong blur-xl" />
          <Shield className="w-12 h-12 text-primary relative z-10" />
        </div>
        
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Zero-Surveillance Seal
            </h3>
            <p className="text-sm text-muted-foreground">
              Your privacy is sacred. Here's our commitment:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guarantees.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground italic">
              "We log as little as possible. Confessions are never stored. No third-party tracking. Ever."
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
