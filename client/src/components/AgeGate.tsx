import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AgeGate({ onVerified }: { onVerified: () => void }) {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);

  const handleVerify = () => {
    localStorage.setItem("ryvynn_age_verified", "true");
    onVerified();
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 p-6">
      <Card className="max-w-2xl w-full bg-card border-primary/30 p-8">
        <div className="flex flex-col items-center space-y-6">
          <Flame className="w-16 h-16 text-primary" />
          <h1 className="text-3xl font-bold text-foreground text-center">
            {t('common.appName')}
          </h1>
          <p className="text-muted-foreground text-center text-lg">
            {t('common.tagline')}
          </p>

          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 w-full">
            <h2 className="text-xl font-semibold text-foreground">
              {t('ageGate.title')}
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">{t('ageGate.ageRequirement')}</strong>
              </p>
              <p>
                <strong className="text-foreground">{t('ageGate.wellnessNotice')}</strong>
                {" "}{t('ageGate.wellnessDetails')}
              </p>
              <p>
                <strong className="text-foreground">{t('ageGate.crisisNotice')}</strong> {t('ageGate.crisisAction')}{" "}
                <strong className="text-primary">{t('ageGate.crisisNumber')}</strong> {t('ageGate.crisisLocation')}
              </p>
              <p>
                {t('ageGate.acknowledgment')}
              </p>
            </div>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-border bg-surface text-primary focus:ring-primary"
            />
            <span className="text-foreground">
              {t('ageGate.checkbox')}
            </span>
          </label>

          <Button
            onClick={handleVerify}
            disabled={!agreed}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg"
          >
            {t('ageGate.enter')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
