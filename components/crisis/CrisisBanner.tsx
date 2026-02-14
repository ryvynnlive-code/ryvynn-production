'use client';

export function CrisisBanner() {
  return (
    <div className="bg-red-900/40 border-b border-red-500/50 py-3 px-4 text-center">
      <p className="text-white text-sm">
        <span className="font-bold">Crisis Support:</span>{' '}
        <a href="tel:988" className="underline hover:text-red-300">
          988 Lifeline
        </a>
        {' · '}
        <a href="sms:741741" className="underline hover:text-red-300">
          Text 741741
        </a>
        {' · '}
        <a 
          href="https://988lifeline.org/chat" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-red-300"
        >
          Chat Online
        </a>
      </p>
    </div>
  );
}
