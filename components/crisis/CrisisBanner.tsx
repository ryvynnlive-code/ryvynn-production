'use client';

import { Phone, MessageCircle, Globe } from 'lucide-react';

export function CrisisBanner() {
  return (
    <div className="bg-card/80 border-b border-border py-2.5 px-4">
      <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-4 flex-wrap">
        <span className="font-semibold text-foreground">Crisis Support:</span>
        <a
          href="tel:988"
          className="inline-flex items-center gap-1 text-flame-400 hover:text-flame-300 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>988 Lifeline</span>
        </a>
        <a
          href="sms:741741"
          className="inline-flex items-center gap-1 text-flame-400 hover:text-flame-300 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Text 741741</span>
        </a>
        <a
          href="https://988lifeline.org/chat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-flame-400 hover:text-flame-300 transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Chat Online</span>
        </a>
      </p>
    </div>
  );
}
