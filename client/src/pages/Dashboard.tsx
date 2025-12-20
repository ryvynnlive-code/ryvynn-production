import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookText,
  Coins,
  Flame,
  Loader2,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

/**
 * Manage Subscription Button Component
 */
function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const createPortal = trpc.payment.createPortalSession.useMutation();

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const result = await createPortal.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to open subscription management");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={loading}
      className="bg-primary hover:bg-primary/90"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        "Manage Subscription"
      )}
    </Button>
  );
}

/**
 * RYVYNN Dashboard
 * Central hub for all wellness features
 */
export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user's ritual status
  const { data: ritualData, isLoading: ritualLoading } = trpc.rituals.getToday.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch Soul Token balance
  const { data: tokenData, isLoading: tokenLoading } = trpc.soulTokens.getBalance.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const streak = ritualData?.streak || 0;
  const soulTokenBalance = tokenData?.balance || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-primary glow" />
              <span className="text-2xl font-bold gradient-text">{APP_TITLE}</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Soul Tokens:</span>
                <span className="font-semibold text-foreground">{soulTokenBalance}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Streak:</span>
                <span className="font-semibold text-foreground">{streak} days</span>
              </div>

              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {user?.name || "Settings"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, <span className="gradient-text">{user?.name || "friend"}</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Your sanctuary awaits. What do you need today?
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Dual Flame */}
          <Link href="/confess">
            <Card className="cyber-card cursor-pointer group h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:glow transition-all">
                  <Flame className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Confess</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  Share anything anonymously. Receive wisdom from Dual Flame.
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  <span>Open your heart</span>
                  <Sparkles className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Journal */}
          <Link href="/journal">
            <Card className="cyber-card cursor-pointer group h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:glow transition-all">
                  <BookText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Journal</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  Write privately. Get AI reflections and insights.
                </p>
                <div className="mt-4 flex items-center text-secondary text-sm font-medium">
                  <span>Explore your thoughts</span>
                  <Sparkles className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Daily Rituals */}
          <Link href="/rituals">
            <Card className="cyber-card cursor-pointer group h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:glow transition-all">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Daily Rituals</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  Start your day with wisdom, breathing, and grounding.
                </p>
                <div className="mt-4 flex items-center text-accent text-sm font-medium">
                  <span>Begin your practice</span>
                  <Sparkles className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Miracle Feed */}
          <Link href="/feed">
            <Card className="cyber-card cursor-pointer group h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:glow transition-all">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Miracle Feed</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  Read stories of healing. Know you're not alone.
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  <span>Find connection</span>
                  <Sparkles className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Soul Tokens */}
          <Link href="/tokens">
            <Card className="cyber-card cursor-pointer group h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:glow transition-all">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Soul Tokens</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  View your balance. Donate to help others in need.
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  <span>Create impact</span>
                  <Coins className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Pass the Flame - v1.40 */}
          <Link href="/flame">
            <Card className="cyber-card cursor-pointer group h-full border-primary/30">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:glow transition-all">
                  <Flame className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Pass the Flame</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  Send anonymous light to someone who needs it. Pure intention.
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  <span>Send light</span>
                  <Sparkles className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Crisis Support */}
          <Link href="/crisis">
            <Card className="cyber-card cursor-pointer group h-full border-destructive/20">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-destructive/10 rounded-lg w-fit group-hover:glow transition-all">
                  <Shield className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Crisis Support</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  Immediate help when you need it most. Always available.
                </p>
                <div className="mt-4 flex items-center text-destructive text-sm font-medium">
                  <span>Get help now</span>
                  <Shield className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Today's Progress */}
        {!ritualLoading && ritualData && (
          <div className="mb-12 fade-in">
            <h2 className="text-3xl font-bold mb-6">Today's Progress</h2>
            <Card className="cyber-card">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${ritualData.ritual.dailyTruthViewed ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Sparkles className={`w-6 h-6 ${ritualData.ritual.dailyTruthViewed ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Daily Truth</p>
                    <p className="text-sm text-muted-foreground">
                      {ritualData.ritual.dailyTruthViewed ? 'Completed' : 'Not yet'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${ritualData.ritual.confessionCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Flame className={`w-6 h-6 ${ritualData.ritual.confessionCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Confession</p>
                    <p className="text-sm text-muted-foreground">
                      {ritualData.ritual.confessionCompleted ? 'Completed' : 'Not yet'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${ritualData.ritual.journalEntryCompleted ? 'bg-secondary/20' : 'bg-muted'}`}>
                    <BookText className={`w-6 h-6 ${ritualData.ritual.journalEntryCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Journal Entry</p>
                    <p className="text-sm text-muted-foreground">
                      {ritualData.ritual.journalEntryCompleted ? 'Completed' : 'Not yet'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens earned today</p>
                    <p className="text-2xl font-bold text-primary">{ritualData.ritual.tokensEarnedToday}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current streak</p>
                    <p className="text-2xl font-bold text-accent">{streak} days</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Subscription Management */}
        {user?.subscriptionTier && user.subscriptionTier !== "zero" && (
          <div className="mb-12 fade-in">
            <h2 className="text-3xl font-bold mb-6">Subscription</h2>
            <Card className="cyber-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    RYVYNN {user.subscriptionTier.toUpperCase()}
                  </h3>
                  <p className="text-muted-foreground">
                    Status: <span className="text-primary font-medium">{user.subscriptionStatus || "active"}</span>
                  </p>
                  {user.subscriptionEndsAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.subscriptionStatus === "canceled" 
                        ? `Access until ${new Date(user.subscriptionEndsAt).toLocaleDateString()}`
                        : `Renews on ${new Date(user.subscriptionEndsAt).toLocaleDateString()}`
                      }
                    </p>
                  )}
                </div>
                <ManageSubscriptionButton />
              </div>
            </Card>
          </div>
        )}

        {/* Inspirational Quote */}
        <div className="text-center py-12 fade-in">
          <div className="flex justify-center mb-6">
            <Flame className="w-12 h-12 text-primary breathe" />
          </div>
          <p className="text-2xl md:text-3xl font-light text-foreground/80 max-w-3xl mx-auto">
            "From our darkest hours to our brightest days"
          </p>
          <p className="text-lg text-muted-foreground mt-4">
            Every step forward is a victory. We're here with you.
          </p>
        </div>
      </main>
    </div>
  );
}
