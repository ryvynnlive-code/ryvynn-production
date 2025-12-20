import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowLeft, ExternalLink, Flame, Loader2, Phone, Shield } from "lucide-react";
import { Link } from "wouter";

/**
 * Crisis Support Page
 * "Immediate help when you need it most"
 */
export default function Crisis() {
  // Fetch crisis resources (would use user's region in production)
  const { data: resources = [], isLoading } = trpc.crisis.getResources.useQuery({});

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-destructive/30 bg-destructive/5 backdrop-blur-sm sticky top-0 z-40">
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
                <Shield className="w-6 h-6 text-destructive glow" />
                <span className="text-xl font-bold text-destructive">Crisis Support</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Emergency Alert */}
        <Card className="bg-destructive/10 border-destructive/30 mb-8 fade-in">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-destructive mt-1 flex-shrink-0" />
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-destructive mb-2">
                  If you're in immediate danger
                </h2>
                <p className="text-foreground/90 text-lg">
                  Please call emergency services (911 in the US) or go to your nearest emergency room.
                  You don't have to face this alone.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <a href="tel:988" className="block">
                  <Button variant="destructive" size="lg" className="w-full glow-strong">
                    <Phone className="mr-2 w-5 h-5" />
                    Call 988 (US Suicide & Crisis Lifeline)
                  </Button>
                </a>
                <a href="sms:741741&body=HOME" className="block">
                  <Button variant="destructive" size="lg" className="w-full">
                    <Phone className="mr-2 w-5 h-5" />
                    Text HOME to 741741 (Crisis Text Line)
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Hero */}
        <div className="text-center space-y-4 mb-12 fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 glow-strong blur-2xl" />
              <Shield className="w-16 h-16 text-primary relative z-10 breathe" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            You Are <span className="gradient-text">Not Alone</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help is available 24/7. These resources are here for you, no matter what you're going through.
          </p>
        </div>

        {/* Dark Hour Ritual - v1.40 */}
        <Link href="/dark-hour">
          <Card className="cyber-card mb-8 cursor-pointer hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Flame className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">Try the Dark Hour Ritual</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A guided path through your darkest moments. Breath, grounding, and reflection.
                  Structured support when everything feels overwhelming.
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  <span>Begin the ritual</span>
                  <Flame className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>
          </Card>
        </Link>

        {/* Immediate Grounding Exercise */}
        <Card className="cyber-card mb-8">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
            <Flame className="w-6 h-6 text-accent" />
            Grounding Exercise (Right Now)
          </h3>
          <div className="space-y-4 text-foreground/90">
            <p className="font-medium">Take a moment to ground yourself with the 5-4-3-2-1 technique:</p>
            <ul className="space-y-2 ml-6">
              <li><strong>5 things you can see</strong> - Look around and name them</li>
              <li><strong>4 things you can touch</strong> - Feel their texture</li>
              <li><strong>3 things you can hear</strong> - Listen carefully</li>
              <li><strong>2 things you can smell</strong> - Notice the scents</li>
              <li><strong>1 thing you can taste</strong> - Focus on the sensation</li>
            </ul>
            <p className="text-muted-foreground italic">
              This exercise helps bring you back to the present moment when overwhelming feelings arise.
            </p>
          </div>
        </Card>

        {/* Crisis Resources */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Crisis Resources</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : resources.length === 0 ? (
            <Card className="cyber-card">
              <p className="text-center text-muted-foreground py-8">
                Loading resources...
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {resources.map((resource: any) => (
                <Card key={resource.id} className="cyber-card">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-semibold mb-1">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {resource.country} {resource.region && `• ${resource.region}`}
                        </p>
                      </div>
                      {resource.available24_7 && (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          24/7
                        </span>
                      )}
                    </div>

                    {resource.description && (
                      <p className="text-foreground/80">{resource.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      {resource.phone && (
                        <a href={`tel:${resource.phone}`}>
                          <Button variant="outline" size="sm">
                            <Phone className="mr-2 w-4 h-4" />
                            {resource.phone}
                          </Button>
                        </a>
                      )}
                      {resource.sms && (
                        <a href={`sms:${resource.sms}`}>
                          <Button variant="outline" size="sm">
                            <Phone className="mr-2 w-4 h-4" />
                            Text {resource.sms}
                          </Button>
                        </a>
                      )}
                      {resource.website && (
                        <a href={resource.website} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 w-4 h-4" />
                            Website
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <Card className="cyber-card mt-8">
          <h3 className="text-2xl font-semibold mb-4">International Resources</h3>
          <div className="space-y-3 text-foreground/90">
            <p>
              <strong>Find a Helpline:</strong>{" "}
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                findahelpline.com
              </a>
            </p>
            <p>
              <strong>International Association for Suicide Prevention:</strong>{" "}
              <a
                href="https://www.iasp.info/resources/Crisis_Centres/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Crisis Centers Directory
              </a>
            </p>
          </div>
        </Card>

        {/* Return to Safety */}
        <div className="mt-12 text-center space-y-6 fade-in">
          <div className="flex justify-center">
            <Flame className="w-12 h-12 text-primary breathe" />
          </div>
          <h2 className="text-3xl font-bold">
            You matter. Your life <span className="gradient-text">matters</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From our darkest hours to our brightest days. We're here with you, every step of the way.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="glow">
              Return to Your Sanctuary
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
