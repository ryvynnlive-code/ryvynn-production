import { Shield } from "lucide-react";
import { Link } from "wouter";

export default function CrisisBanner() {
  return (
    <Link href="/crisis">
      <button className="fixed bottom-6 right-6 bg-destructive hover:bg-destructive/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 transition-all hover:scale-105 glow">
        <Shield className="w-5 h-5" />
        <span className="font-semibold">Need help now?</span>
      </button>
    </Link>
  );
}
