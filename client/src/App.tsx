import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomeNew from "./pages/HomeNew";
import Aonixx from "./pages/Aonixx";
import Dashboard from "./pages/Dashboard";
import Confess from "./pages/Confess";
import Feed from "./pages/Feed";
import Journal from "./pages/Journal";
import Rituals from "./pages/Rituals";
import SoulTokens from "./pages/SoulTokens";
import Crisis from "./pages/Crisis";
import Settings from "./pages/Settings";
import PassTheFlame from "./pages/PassTheFlame";
import DarkHourRitual from "./pages/DarkHourRitual";
import Origin from "./pages/Origin";
import Manifesto from "./pages/Manifesto";
import About from "./pages/About";
import Investors from "./pages/Investors";
import Waitlist from "./pages/Waitlist";
import Trust from "./pages/Trust";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import WaitlistAdmin from "./pages/WaitlistAdmin";
import Crisis988 from "./pages/Crisis988";
import Crisis911 from "./pages/Crisis911";
import Chat from "./pages/Chat";
import MoodCheckIn from "./pages/MoodCheckIn";
import GuidedRituals from "./pages/GuidedRituals";
import BrightDaysReflection from "./pages/BrightDaysReflection";
import AgeGate from "./components/AgeGate";
import CrisisBanner from "./components/CrisisBanner";
import BrightnessWrapper from "./components/BrightnessWrapper";
import MobileBottomNav from "./components/MobileBottomNav";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={HomeNew} />
      <Route path="/aonixx" component={Aonixx} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/confess"} component={Confess} />
      <Route path={"/feed"} component={Feed} />
      <Route path={"/journal"} component={Journal} />
      <Route path={"/rituals"} component={Rituals} />
      <Route path={"/tokens"} component={SoulTokens} />
      <Route path={"/crisis"} component={Crisis} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/flame"} component={PassTheFlame} />
      <Route path={"/dark-hour"} component={DarkHourRitual} />
      <Route path={"/origin"} component={Origin} />
      <Route path={"/manifesto"} component={Manifesto} />
      <Route path={"/about"} component={About} />
      <Route path={"/investors"} component={Investors} />
      <Route path={"/waitlist"} component={Waitlist} />
      <Route path={"/trust"} component={Trust} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/admin/waitlist"} component={WaitlistAdmin} />
      <Route path={"/988"} component={Crisis988} />
      <Route path={"/911"} component={Crisis911} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/mood"} component={MoodCheckIn} />
      <Route path={"/guided-rituals"} component={GuidedRituals} />
      <Route path={"/bright-days"} component={BrightDaysReflection} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * RYVYNN - "From our darkest hours to our brightest days"
 * Cyber-sacred × Minimal-futuristic × Resilience
 */
function App() {
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem("ryvynn_age_verified") === "true";
  });

  // Force document title override
  useEffect(() => {
    document.title = "RYVYNN";
  }, []);

  if (!ageVerified) {
    return <AgeGate onVerified={() => setAgeVerified(true)} />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <BrightnessWrapper>
            {/* Skip to main content for keyboard/screen reader users */}
            <a href="#main" className="skip-link">
              Skip to main content
            </a>
            <Toaster />
            <CrisisBanner />
            <main id="main">
              <Router />
            </main>
            <MobileBottomNav />
            <PWAInstallPrompt />
          </BrightnessWrapper>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
