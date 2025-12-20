import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

/**
 * Soul Tokens Page
 * "Your healing creates real-world impact"
 */
export default function SoulTokens() {
  const [donationAmount, setDonationAmount] = useState("");

  const utils = trpc.useUtils();

  // Fetch balance
  const { data: balanceData, isLoading: balanceLoading } = trpc.soulTokens.getBalance.useQuery();

  // Fetch history
  const { data: history = [], isLoading: historyLoading } = trpc.soulTokens.getHistory.useQuery({ limit: 50 });

  // Donate mutation
  const donateMutation = trpc.soulTokens.donate.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your donation! Your tokens will help others in need.");
      setDonationAmount("");
      utils.soulTokens.getBalance.invalidate();
      utils.soulTokens.getHistory.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to donate tokens");
    },
  });

  const handleDonate = () => {
    const amount = parseInt(donationAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > (balanceData?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    donateMutation.mutate({ amount });
  };

  const balance = balanceData?.balance || 0;

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
                <Heart className="w-6 h-6 text-secondary glow" />
                <span className="text-xl font-bold gradient-text">Soul Tokens</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center space-y-4 mb-12 fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 glow-strong blur-2xl" />
              <Heart className="w-16 h-16 text-secondary relative z-10 breathe" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Soul <span className="gradient-text">Tokens</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Your healing creates real-world impact
          </p>
        </div>

        {balanceLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Balance Card */}
            <Card className="cyber-card glow text-center py-12">
              <p className="text-sm text-muted-foreground mb-2">Your Balance</p>
              <p className="text-6xl font-bold gradient-text mb-4">{balance}</p>
              <p className="text-sm text-muted-foreground">Soul Tokens</p>
            </Card>

            {/* How to Earn */}
            <Card className="cyber-card">
              <h3 className="text-2xl font-semibold mb-4">How to Earn Soul Tokens</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">10</span>
                  </div>
                  <p>Complete your Daily Truth</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">10</span>
                  </div>
                  <p>Share a confession with Dual Flame</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">10</span>
                  </div>
                  <p>Write a journal entry</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">10</span>
                  </div>
                  <p>Complete a breathing exercise</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-secondary">+</span>
                  </div>
                  <p>Maintain your daily streak for bonus tokens</p>
                </div>
              </div>
            </Card>

            {/* Donate */}
            <Card className="cyber-card">
              <h3 className="text-2xl font-semibold mb-4">Donate to Impact Pool</h3>
              <p className="text-muted-foreground mb-6">
                Your donated tokens help fund mental health resources for those who can't afford them.
                Every token makes a difference.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-2">
                    Donation Amount
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max={balance}
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="bg-background"
                    disabled={donateMutation.isPending}
                  />
                </div>

                <div className="flex gap-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setDonationAmount(amount.toString())}
                      disabled={amount > balance || donateMutation.isPending}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleDonate}
                  disabled={!donationAmount || donateMutation.isPending || balance === 0}
                  className="w-full glow"
                  size="lg"
                >
                  {donateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Donating...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 w-4 h-4" />
                      Donate {donationAmount || "0"} Tokens
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="cyber-card">
              <h3 className="text-2xl font-semibold mb-4">Transaction History</h3>

              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions yet. Complete rituals to earn tokens!
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === "earned" ? "bg-primary/10" :
                          tx.type === "donated" ? "bg-secondary/10" :
                          "bg-accent/10"
                        }`}>
                          {tx.type === "donated" ? (
                            <ArrowRight className="w-4 h-4 text-secondary" />
                          ) : (
                            <Heart className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.description || tx.source}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.type === "donated" ? "text-secondary" : "text-primary"
                        }`}>
                          {tx.type === "donated" ? "-" : "+"}{tx.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {tx.balanceAfter}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
