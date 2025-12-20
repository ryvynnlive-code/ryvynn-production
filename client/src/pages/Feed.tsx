import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Flame, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";

/**
 * Miracle Feed - Public stories of healing
 * "You are not alone"
 */
export default function Feed() {
  const [offset, setOffset] = useState(0);
  const limit = 20;
  
  const { data: allEntries = [], isLoading } = trpc.feed.list.useQuery(
    { limit, offset }
  );
  
  const hasMore = allEntries.length === limit;
  
  const loadMore = () => {
    setOffset(offset + limit);
  };

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
                <MessageSquare className="w-6 h-6 text-primary glow" />
                <span className="text-xl font-bold gradient-text">Miracle Feed</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12 fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 glow-strong blur-2xl" />
              <Sparkles className="w-16 h-16 text-primary relative z-10 breathe" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Miracle</span> Feed
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stories of courage and healing. Every voice is heard. You are not alone.
          </p>
        </div>

        {/* Feed Entries */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : allEntries.length === 0 ? (
          <Card className="cyber-card text-center py-12">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No stories yet. Be the first to share with Dual Flame.
            </p>
            <Link href="/confess">
              <Button className="mt-6">
                Share Your Story
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {allEntries.map((entry, index) => (
              <Card key={entry.id} className="cyber-card fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Flame className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Dual Flame</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.ageTierAnonymized && `${entry.ageTierAnonymized}`}
                          {entry.ageTierAnonymized && entry.regionAnonymized && " • "}
                          {entry.regionAnonymized && `${entry.regionAnonymized}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Response Content */}
                  <div className="prose prose-invert max-w-none">
                    <Streamdown>{entry.response}</Streamdown>
                  </div>
                </div>
              </Card>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Stories
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center space-y-6 fade-in">
          <div className="flex justify-center">
            <Flame className="w-12 h-12 text-primary breathe" />
          </div>
          <h2 className="text-3xl font-bold">
            Add your voice to the <span className="gradient-text">chorus</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your story with Dual Flame. Your words might be the light someone else needs.
          </p>
          <Link href="/confess">
            <Button size="lg" className="glow">
              Share with Dual Flame
              <Sparkles className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
