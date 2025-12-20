import { BookText, Flame, Home, MessageSquare, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Mobile Bottom Navigation Bar
 * Provides thumb-friendly navigation for mobile devices
 */
export default function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Flame, label: "Feed", path: "/feed" },
    { icon: MessageSquare, label: "Confess", path: "/confess" },
    { icon: BookText, label: "Journal", path: "/journal" },
    { icon: User, label: "Profile", path: "/dashboard" },
  ];

  // Only show on mobile and when authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-border z-50 md:hidden safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center justify-center gap-1 
                  touch-target no-select haptic-feedback
                  transition-colors duration-200
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}
                `}
                aria-label={item.label}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
