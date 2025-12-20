import { Button } from "@/components/ui/button";
import OriginScroll from "@/components/OriginScroll";
import { APP_TITLE } from "@/const";
import { ArrowLeft, Flame } from "lucide-react";
import { Link } from "wouter";

/**
 * Origin Page - v1.40
 * Displays the 9-Panel Origin Scroll
 */
export default function Origin() {
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
                <span className="text-xl font-bold gradient-text">{APP_TITLE} Origin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <OriginScroll />
      </main>
    </div>
  );
}
