import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, Loader2, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

/**
 * Private Journal Page
 * "Your thoughts, your sanctuary"
 */
export default function Journal() {
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState<string>("");
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch journal entries
  const { data: entries = [], isLoading } = trpc.journal.list.useQuery({ limit: 10, offset: 0 });

  // Create journal entry mutation
  const createMutation = trpc.journal.create.useMutation({
    onSuccess: () => {
      toast.success("Journal entry saved");
      setContent("");
      setMoodTag("");
      setReflection(null);
      setShowReflection(false);
      utils.journal.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to save journal entry");
    },
  });

  // Get AI reflection mutation
  const reflectMutation = trpc.journal.reflect.useMutation({
    onSuccess: (data) => {
      setReflection(data.reflection);
      setShowReflection(true);
    },
    onError: () => {
      toast.error("Failed to get reflection");
    },
  });

  const handleSave = () => {
    if (content.trim().length < 1) {
      toast.error("Please write something first");
      return;
    }

    createMutation.mutate({
      content,
      moodTag: moodTag as any || undefined,
    });
  };

  const handleReflect = () => {
    if (content.trim().length < 10) {
      toast.error("Please write at least 10 characters to get a reflection");
      return;
    }

    reflectMutation.mutate({ content });
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
                <BookOpen className="w-6 h-6 text-secondary glow" />
                <span className="text-xl font-bold gradient-text">Private Journal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Journal Editor */}
          <div className="lg:col-span-2 space-y-6 fade-in">
            <div className="text-center lg:text-left space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Your <span className="gradient-text">Sanctuary</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Write freely. Your thoughts are encrypted and private.
              </p>
            </div>

            <Card className="cyber-card">
              <div className="space-y-4">
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-2">
                    What's on your mind?
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write freely... This is your private space. No one else will see this unless you choose to share."
                    className="min-h-[400px] resize-none bg-background border-border focus:border-secondary transition-colors"
                    disabled={createMutation.isPending}
                  />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-muted-foreground">
                      {content.split(/\s+/).filter(w => w).length} words
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="mood" className="block text-sm font-medium mb-2">
                    How are you feeling? (optional)
                  </label>
                  <Select value={moodTag} onValueChange={setMoodTag}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your mood..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_good">Very Good</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="very_low">Very Low</SelectItem>
                      <SelectItem value="joyful">Joyful</SelectItem>
                      <SelectItem value="peaceful">Peaceful</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="anxious">Anxious</SelectItem>
                      <SelectItem value="angry">Angry</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleReflect}
                    disabled={content.trim().length < 10 || reflectMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {reflectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Reflecting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 w-4 h-4" />
                        Reflect with AI
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={content.trim().length < 1 || createMutation.isPending}
                    className="flex-1 glow"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 w-4 h-4" />
                        Save Entry
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* AI Reflection */}
            {showReflection && reflection && (
              <Card className="cyber-card glow fade-in">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <Sparkles className="w-6 h-6 text-secondary" />
                    <span className="font-semibold text-lg">AI Reflection</span>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <Streamdown>{reflection}</Streamdown>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Recent Entries Sidebar */}
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold">Recent Entries</h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : entries.length === 0 ? (
              <Card className="cyber-card text-center py-8">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No entries yet. Start writing!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {entries.map((entry: any) => (
                  <Card key={entry.id} className="cyber-card p-4 cursor-pointer hover:border-secondary/50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        {entry.moodTag && (
                          <span className="px-2 py-1 bg-secondary/10 rounded text-secondary">
                            {entry.moodTag.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-3">
                        {entry.content}
                      </p>
                      {entry.wordCount && (
                        <p className="text-xs text-muted-foreground">
                          {entry.wordCount} words
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
