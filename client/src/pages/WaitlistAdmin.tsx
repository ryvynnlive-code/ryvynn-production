import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Mail, Calendar, User } from "lucide-react";
import { useLocation } from "wouter";

type WaitlistEntry = {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  referralSource: string | null;
  soulTokensAwarded: boolean | null;
  userId: number | null;
};

export default function WaitlistAdmin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: waitlist, isLoading } = trpc.admin.getWaitlist.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You must be an admin to view this page.</p>
          <Button onClick={() => setLocation("/")}>Return Home</Button>
        </Card>
      </div>
    );
  }

  const exportCSV = () => {
    if (!waitlist || waitlist.length === 0) return;

    const headers = ["Email", "Name", "Joined At"];
    const rows = waitlist.map((entry: WaitlistEntry) => [
      entry.email,
      entry.name || "",
      new Date(entry.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ryvynn-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Waitlist Admin</h1>
              <p className="text-gray-400 mt-1">
                {waitlist?.length || 0} total signups
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportCSV}
                disabled={!waitlist || waitlist.length === 0}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => setLocation("/dashboard")} variant="ghost">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading waitlist...</p>
          </div>
        ) : !waitlist || waitlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No signups yet</h2>
            <p className="text-gray-400">
              Waitlist signups will appear here once users join.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {waitlist.map((entry: WaitlistEntry) => (
              <Card key={entry.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="font-mono text-lg">{entry.email}</span>
                    </div>
                    {entry.name && (
                      <div className="flex items-center gap-3 text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{entry.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
