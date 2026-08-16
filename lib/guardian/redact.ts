// lib/guardian/redact.ts
// Client-side PII redaction. Runs entirely in browser memory.
// No raw text ever leaves this function unredacted.

export interface RedactionResult {
  text: string;
  redacted: boolean;
  categories: string[];
}

// Ordered by severity — more specific patterns first to avoid partial matches
const PATTERNS: Array<{ name: string; re: RegExp; replacement: string }> = [
  // SSN — before phone so ###-##-#### isn't swallowed by phone pattern
  {
    name: 'ssn',
    re: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    replacement: '[redacted]',
  },
  // Credit / debit card numbers (13-19 digits, optional spaces/dashes)
  {
    name: 'card',
    re: /\b(?:\d[ -]?){13,19}\b/g,
    replacement: '[redacted]',
  },
  // Email addresses
  {
    name: 'email',
    re: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: '[redacted]',
  },
  // US/CA phone numbers — liberal match
  {
    name: 'phone',
    re: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b/g,
    replacement: '[redacted]',
  },
  // IPv4
  {
    name: 'ip',
    re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: '[redacted]',
  },
  // Street addresses — "123 Main St", "45 W 56th Ave", etc.
  {
    name: 'address',
    re: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:St(?:reet)?|Ave(?:nue)?|Blvd|Rd|Dr|Ln|Ct|Pl|Way|Ter)\b\.?/gi,
    replacement: '[redacted]',
  },
  // US ZIP codes (standalone, to catch what address pattern missed)
  {
    name: 'zip',
    re: /\b\d{5}(?:-\d{4})?\b/g,
    replacement: '[redacted]',
  },
  // Full name pattern: "First Last" where both words are title-cased and 2+ chars
  // Deliberately conservative — only catches clear "Name Name" in sentence context
  {
    name: 'name',
    re: /(?<!\w)(?:[A-Z][a-z]{1,20}\s){1,2}[A-Z][a-z]{1,20}(?=\s+(?:is|was|said|told|asked|called|lives|works|died|got|had|has|went|came|and\b))/g,
    replacement: '[name]',
  },
];

export function redactPII(input: string): RedactionResult {
  let text = input;
  const categories: string[] = [];

  for (const { name, re, replacement } of PATTERNS) {
    const before = text;
    text = text.replace(re, replacement);
    if (text !== before) categories.push(name);
  }

  return {
    text,
    redacted: categories.length > 0,
    categories,
  };
}
