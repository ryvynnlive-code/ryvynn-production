import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliance & Legal Standing | RYVYNN',
  description:
    'RYVYNN legal and regulatory assessment. Zero-surveillance architecture, HIPAA analysis, FTC alignment, state AI disclosure compliance, and data privacy standing as of April 2026.',
  openGraph: {
    title: 'RYVYNN — Compliance & Legal Standing',
    description:
      'Zero-retention architecture. No PHI generated. No accounts. No tracking. Privacy-first by design.',
    url: 'https://ryvynn.live/compliance',
    images: [{ url: '/assets/dual-flame-logo.png', width: 512, height: 512 }],
  },
};

const riskItems = [
  {
    area: 'HIPAA',
    status: 'CLEAR',
    color: 'green',
    detail: 'No PHI generated. Not a covered entity.',
  },
  {
    area: 'FTC / Deceptive Practices',
    status: 'MONITOR',
    color: 'yellow',
    detail: 'Claims must match backend reality at all times.',
  },
  {
    area: 'AI Disclosure (State)',
    status: 'ACTION',
    color: 'red',
    detail: 'Explicit AI-not-human notice required at chat entry.',
  },
  {
    area: 'COPPA',
    status: 'ACTION',
    color: 'red',
    detail: 'No age gate active. Anonymous minors = exposure.',
  },
  {
    area: 'CCPA / Data Privacy',
    status: 'CLEAR',
    color: 'green',
    detail: 'Zero retention sidesteps most obligations.',
  },
  {
    area: 'Crisis Safety Standards',
    status: 'MONITOR',
    color: 'yellow',
    detail: '988 routing documented; C-SSRS logic must stay live.',
  },
  {
    area: 'Trademark / IP',
    status: 'IN PROGRESS',
    color: 'blue',
    detail: 'USPTO filing active. All IP held by NEXXT GEN LLC.',
  },
  {
    area: 'Privacy Policy / ToS',
    status: 'LIVE',
    color: 'green',
    detail: 'Termly-generated docs deployed. Footer-linked.',
  },
];

const actions = [
  {
    num: '01',
    priority: 'CRITICAL',
    title: 'AI Disclosure at Chat Entry',
    body:
      'Add a one-line notice immediately before or at Guardian chat open: "RYVYNN is an AI companion — not a human therapist or licensed provider." California SB 942, New York AI transparency guidance, and FTC deceptive-practices doctrine all require this. It takes 15 minutes to ship. Every day without it is live exposure.',
  },
  {
    num: '02',
    priority: 'CRITICAL',
    title: 'COPPA Safe Harbor Language',
    body:
      'No age gate is active. With anonymous access and no data collection, direct COPPA liability is low — but not zero. Add a ToS clause stating the service is intended for users 13+ (or 18+ if preferred) and that minors use with guardian consent. Display this in the onboarding overlay or sign-up flow. Do not collect or store any data that could identify a minor.',
  },
  {
    num: '03',
    priority: 'HIGH',
    title: 'Technical Truth Audit — Zero-Retention Claim',
    body:
      'The FTC does not punish honest architecture — it punishes gaps between claims and reality. Audit every layer: Vercel request logs, Supabase RLS, Gemini API call logs, and any third-party SDKs (Termly, analytics snippets). Document what is logged, for how long, and by whom. This documentation is your FTC defense file. Refresh it any time infrastructure changes.',
  },
  {
    num: '04',
    priority: 'HIGH',
    title: 'Crisis Protocol Documentation',
    body:
      'RYVYNN\'s C-SSRS-aligned Guardian detection is a legal and ethical asset. Document it formally: what signals trigger escalation, what the AI says, what human resource (988) is surfaced, and how this is tested. This record supports both regulatory inquiries and future grant/contract applications (SAMHSA, VA, HHS). Keep it current with every Guardian model update.',
  },
  {
    num: '05',
    priority: 'MEDIUM',
    title: 'State AI Companion Law Watch List',
    body:
      'California (SB 942, AB 2013), New York, Colorado, and Texas are the active legislative fronts for AI chatbot and companion regulation as of Q1 2026. None has imposed clinical liability on zero-retention anonymous support tools to date, but disclosure, escalation, and transparency requirements are tightening. Engage one AI-specialty attorney for a 1-hour quarterly review — cost is minimal versus exposure.',
  },
  {
    num: '06',
    priority: 'MEDIUM',
    title: 'IP Ownership Clarity — Foundation Licensing',
    body:
      'All intellectual property is owned by NEXXT GEN INNOVATIONS LLC. AONIXX is a registered DBA (umbrella brand). RYVYNN is the consumer sub-brand and product. The RYVYNN Foundation, when formed, must license from the LLC — not own or co-own IP. This structure protects equity value and prevents complications in future VC rounds or government contract bids. Do not file any separate DBA for RYVYNN until licensing terms are drafted.',
  },
  {
    num: '07',
    priority: 'ONGOING',
    title: 'Publish This Assessment',
    body:
      'Transparency is a competitive moat in mental health tech. Publishing a plain-language compliance summary (this page) signals institutional seriousness to regulators, grant reviewers, enterprise buyers, and media. Keep it updated quarterly. Link it from the footer alongside Privacy Policy and Terms of Service.',
  },
];

const growthPriorities = [
  {
    rank: '01',
    label: 'HIGHEST IMPACT',
    title: 'Live Wall Motion + Social Proof Bridge',
    desc:
      'The "23 people typing right now" counter is compelling, but without visible proof — new entries fading in, subtle movement — users discount it as static copy. Animate new Wall entries fading in at the top in real time. Pair with the counter. This bridges the claimed activity with the visual experience and directly attacks the first-10-second hesitation loop. Expected outcome: measurable lift in scroll depth and first interaction rate.',
  },
  {
    rank: '02',
    label: 'HIGH IMPACT',
    title: 'Hero Copy — Visceral Over Descriptive',
    desc:
      'Current headline informs. It needs to overcome resistance. Replace with copy that names the exact internal experience the user is suppressing right now — not what the product does. The gap between "emotional wellness AI" and "say the thing you can\'t say out loud" is the gap between scroll-past and stay. Lead with the wound, not the tool.',
  },
  {
    rank: '03',
    label: 'HIGH IMPACT',
    title: 'Guardian First Response — Direct and Human',
    desc:
      'The first AI response after a user types determines whether they continue or close the tab. It must be short (2–3 sentences max), warm without being clinical, and reflect the exact emotional weight of what was said. Generic acknowledgment destroys trust. Train, test, and lock the opening response pattern as a brand constant — same rigor applied to the Founding Statement.',
  },
];

const colorMap: Record<string, string> = {
  green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  red: 'text-red-400 bg-red-400/10 border-red-400/30',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
};

const priorityColor: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/30',
  HIGH: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  MEDIUM: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  ONGOING: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-gray-200">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0D1117]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#00D9FF] border border-[#00D9FF]/25 px-3 py-1.5 rounded mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-pulse" />
            Legal &amp; Regulatory Assessment
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Compliance &amp; Legal Standing
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            NEXXT GEN INNOVATIONS LLC · DBA AONIXX · Product: RYVYNN · April 2026
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/5">
            {[
              { label: 'Assessed', value: 'April 2026' },
              { label: 'Entity', value: 'NEXXT GEN LLC' },
              { label: 'CAGE Code', value: '0YQ06' },
              { label: 'NAICS', value: '621420' },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">{m.label}</div>
                <div className="text-sm font-medium text-white">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        {/* Risk Matrix */}
        <section>
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Risk Matrix</div>
          <h2 className="text-xl font-bold text-white mb-6">Overall Risk Snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riskItems.map((item) => (
              <div
                key={item.area}
                className="flex items-start gap-4 bg-[#0D1117] border border-white/5 rounded-lg p-4"
              >
                <div className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border whitespace-nowrap mt-0.5 ${colorMap[item.color]}`}>
                  {item.status}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.area}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HIPAA */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Section 01</div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">HIPAA</h2>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-emerald-400 bg-emerald-400/10 border-emerald-400/30">CLEAR</span>
          </div>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              HIPAA governs <strong className="text-white">covered entities</strong> — healthcare providers, health plans, and their business associates — that handle Protected Health Information (PHI). RYVYNN is none of these. It is a general-purpose anonymous emotional support tool, not a clinical provider.
            </p>
            <p>
              Because RYVYNN claims and enforces zero data retention, no conversation content is stored, transmitted on behalf of a covered entity, or linked to an identifiable individual. Without stored data, there is no PHI. Without PHI, HIPAA does not apply.
            </p>
            <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4 text-sm text-gray-300">
              <div className="text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-2">Verdict</div>
              The zero-retention architecture is not just a privacy feature — it is the mechanism that keeps HIPAA inapplicable. Maintain it. Any future feature that logs, stores, or transmits identifiable health content must be re-evaluated against HIPAA before launch.
            </div>
          </div>
        </section>

        {/* FTC */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Section 02</div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">FTC — Deceptive Practices</h2>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-yellow-400 bg-yellow-400/10 border-yellow-400/30">MONITOR</span>
          </div>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              The Federal Trade Commission enforces Section 5 of the FTC Act against unfair or deceptive acts. RYVYNN makes prominent, specific public claims: <em className="text-white">"Nothing saved. Gone when you leave."</em> These statements are not aspirational — they are material representations that must be technically true at every layer of the stack.
            </p>
            <p>
              The FTC's 2023–2026 enforcement posture on AI products has focused specifically on gaps between public privacy claims and actual backend behavior. Enforcement actions have been issued for server logs, third-party SDKs, and analytics tools that silently retained data operators believed was discarded.
            </p>
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4 text-sm text-gray-300">
              <div className="text-yellow-400 text-[10px] font-mono tracking-widest uppercase mb-2">Action Required</div>
              Conduct a technical audit of all data touch points: Vercel infrastructure logs, Supabase RLS enforcement, Gemini API call retention, Termly/analytics snippet behavior, and any abuse-prevention middleware. Document findings. Any non-user-content logging (e.g., access logs) must be anonymized and scoped to the minimum retention period. This documentation is the FTC defense file.
            </div>
          </div>
        </section>

        {/* State AI Laws */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Section 03</div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">State AI Disclosure Laws</h2>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-red-400 bg-red-400/10 border-red-400/30">ACTION REQUIRED</span>
          </div>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              Multiple states have enacted or are actively advancing AI transparency and chatbot disclosure requirements. The two highest-exposure jurisdictions for a nationally-accessible product are California and New York.
            </p>
            <p>
              <strong className="text-white">California SB 942 (AI Transparency Act, effective 2025)</strong> requires that AI systems capable of generating synthetic content — including conversational AI — identify themselves as AI at the point of interaction. The standard is whether a reasonable person could be misled into believing they are communicating with a human.
            </p>
            <p>
              <strong className="text-white">Additional state-level requirements</strong> (Colorado, Texas, and a growing list) are converging on shared disclosure obligations: AI must identify itself at the start of any automated conversation, particularly where the subject matter involves emotional, health, or personal welfare content. Failure to disclose is the highest-frequency violation in this category.
            </p>
            <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-4 text-sm text-gray-300">
              <div className="text-red-400 text-[10px] font-mono tracking-widest uppercase mb-2">Fix Now — 15 Minutes</div>
              Add a single visible line at Guardian chat entry: <em className="text-white">"RYVYNN is an AI companion — not a human therapist or licensed mental health provider."</em> This one change satisfies the primary disclosure requirement across all current state statutes. Do not delay this.
            </div>
            <p className="text-sm text-gray-500">
              Note: State AI legislation is moving rapidly. The statutes referenced here reflect Q1 2026 status. Engage qualified counsel for quarterly verification — particularly for any features involving minors, clinical language, or expanded data handling.
            </p>
          </div>
        </section>

        {/* COPPA */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Section 04</div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">COPPA — Minor User Risk</h2>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-red-400 bg-red-400/10 border-red-400/30">ACTION REQUIRED</span>
          </div>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              The Children's Online Privacy Protection Act (COPPA) applies to operators of websites or online services directed at children under 13, or who have actual knowledge they are collecting data from users under 13. RYVYNN does not actively collect data — which dramatically lowers COPPA exposure.
            </p>
            <p>
              However: <strong className="text-white">the age gate was removed from the current build.</strong> Anonymous access is open to all users without age verification. A minor in emotional crisis can reach the Guardian with no friction — which is compassionate by design but creates a documented COPPA-adjacent risk vector if any data collection ever occurs (even temporarily, even via third-party SDK).
            </p>
            <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-4 text-sm text-gray-300">
              <div className="text-red-400 text-[10px] font-mono tracking-widest uppercase mb-2">Minimum Required Action</div>
              Add language to the Terms of Service stating the service is designed for users 13 or older and that use by minors under 13 is not permitted without parental consent. Surface this in the onboarding overlay — one sentence is sufficient. This creates a defensible terms-of-use record without re-adding a hard age gate that reduces conversion.
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Section 05</div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">Data Privacy — CCPA &amp; Federal</h2>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-emerald-400 bg-emerald-400/10 border-emerald-400/30">LARGELY CLEAR</span>
          </div>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              The California Consumer Privacy Act (CCPA) and its 2023 amendment (CPRA) impose obligations on businesses that collect, sell, or share personal information of California residents above defined revenue or data-volume thresholds. A zero-retention architecture generating no stored user data does not reach these thresholds under current statute.
            </p>
            <p>
              <strong className="text-white">Privacy Policy and Terms of Service are live</strong> via Termly, footer-linked. This satisfies the baseline disclosure obligation under CCPA and most state privacy frameworks currently in force.
            </p>
            <p>
              Continued compliance requires that any future feature — Soul Token purchase history, Stripe payment records, Eternity Vault content — is handled under a documented data retention and deletion policy and disclosed in the existing privacy policy before launch, not after.
            </p>
          </div>
        </section>

        {/* Crisis Safety */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Section 06</div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">Mental Health Safety Standards</h2>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-yellow-400 bg-yellow-400/10 border-yellow-400/30">MONITOR</span>
          </div>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              No federal license is required for non-clinical AI emotional support tools. RYVYNN does not diagnose, prescribe, treat, or bill for clinical services. Its legal classification is as a general consumer wellness application — the same category as journaling apps, meditation tools, or anonymous peer support platforms.
            </p>
            <p>
              RYVYNN's C-SSRS-aligned Guardian crisis detection — routing users to 988 Suicide &amp; Crisis Lifeline when escalation thresholds are met — is best practice and a significant legal asset. This feature must be maintained, documented, and tested with every Guardian model update. It is both a mission obligation and a regulatory shield.
            </p>
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4 text-sm text-gray-300">
              <div className="text-yellow-400 text-[10px] font-mono tracking-widest uppercase mb-2">Standing Requirement</div>
              The Guardian must never provide specific self-harm methods, encourage dangerous behavior, or substitute clinical advice. Responses should reflect the 4th–5th grade reading level, 3-line structure, and crisis escalation protocol already defined as brand constants. These are not just brand decisions — they are liability management.
            </div>
          </div>
        </section>

        {/* IP / Trademark */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Section 07</div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">Intellectual Property &amp; Entity Structure</h2>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-blue-400 bg-blue-400/10 border-blue-400/30">IN PROGRESS</span>
          </div>
          <div className="space-y-4 text-[15px] text-gray-300 leading-relaxed">
            <p>
              <strong className="text-white">Legal Structure:</strong> All intellectual property — code, brand, product, content — is owned by <strong className="text-white">NEXXT GEN INNOVATIONS LLC</strong>. AONIXX is a registered DBA functioning as the umbrella brand. RYVYNN is the consumer sub-brand and product. Correct legal attribution is: <em className="text-white">"AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC."</em> No separate RYVYNN entity or DBA exists or should be created until equity fundraising is imminent and counsel has reviewed the conversion.
            </p>
            <p>
              <strong className="text-white">Federal Registration:</strong> SAM.gov active. CAGE Code 0YQ06. DUNS and EIN confirmed. NAICS 621420 enables direct bidding on SAMHSA, VA, HHS, and DoD mental health contracts — a material revenue pathway that depends on the LLC remaining the sole contracting entity.
            </p>
            <p>
              <strong className="text-white">Trademark:</strong> USPTO filing for RYVYNN is active. Trademark priority order: RYVYNN first, AONIXX second. The RYVYNN Foundation, when formed, must license from the LLC under a documented IP licensing agreement — it must not hold, co-own, or claim any ownership of the core IP.
            </p>
            <p>
              <strong className="text-white">Do not convert to a corporation</strong> until VC or equity fundraising is active and legal counsel has reviewed the full conversion implications. The LLC structure is correct for the current stage.
            </p>
          </div>
        </section>

        {/* Priority Actions */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Action Plan</div>
          <h2 className="text-xl font-bold text-white mb-6">Priority Actions — Ranked by Urgency</h2>
          <div className="space-y-3">
            {actions.map((a) => (
              <div key={a.num} className="bg-[#0D1117] border border-white/5 rounded-lg p-5 flex gap-5 items-start">
                <div className="text-[#00D9FF] font-mono text-xs font-medium pt-0.5 whitespace-nowrap">{a.num}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-white">{a.title}</span>
                    <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border ${priorityColor[a.priority]}`}>
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Growth Priorities */}
        <section className="border-t border-white/5 pt-12">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Product — Growth Layer</div>
          <h2 className="text-xl font-bold text-white mb-2">Three Highest-Impact Changes Right Now</h2>
          <p className="text-sm text-gray-500 mb-6">These are not legal requirements. These are the three product changes with the strongest direct return on first-session conversion and retention.</p>
          <div className="space-y-4">
            {growthPriorities.map((g) => (
              <div key={g.rank} className="bg-[#0D1117] border border-white/5 rounded-lg p-5 flex gap-5 items-start">
                <div className="text-[#8B5CF6] font-mono text-xs font-medium pt-0.5 whitespace-nowrap">{g.rank}</div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-white">{g.title}</span>
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border text-purple-400 bg-purple-400/10 border-purple-400/30">
                      {g.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Overall Verdict */}
        <section className="border-t border-white/5 pt-12">
          <div className="bg-gradient-to-r from-[#00D9FF]/5 to-[#8B5CF6]/5 border border-white/10 rounded-xl p-8">
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#00D9FF] mb-3">Overall Standing</div>
            <h2 className="text-xl font-bold text-white mb-4">Legal Position: Strong by Design</h2>
            <p className="text-[15px] text-gray-300 leading-relaxed mb-4">
              The zero-retention, no-account, no-tracking architecture places RYVYNN in the lowest-risk tier for a consumer mental wellness product. HIPAA does not apply. CCPA obligations are minimal. Data breach liability is near-zero because there is no stored data to breach.
            </p>
            <p className="text-[15px] text-gray-300 leading-relaxed mb-4">
              The two open critical items — AI disclosure at chat entry, and COPPA language in ToS — are both fixable in under an hour of engineering time. They are not complex legal problems. They are copy changes and ToS clauses.
            </p>
            <p className="text-[15px] text-gray-300 leading-relaxed">
              The FTC audit documentation and state AI law monitoring are ongoing operational hygiene. They protect the claims the product already makes — which are honest. The goal is to ensure the paper trail matches the reality.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-white/5 pt-8">
          <p className="text-xs text-gray-600 leading-relaxed">
            This assessment is a CFO-level strategic compliance review based on publicly available regulatory information and the disclosed technical architecture of RYVYNN as of April 2026. It does not constitute formal legal advice and does not create an attorney-client relationship. Operational compliance is determined by actual backend implementation, not claims alone. For jurisdiction-specific legal guidance — particularly regarding state AI companion statutes and COPPA — engage qualified counsel licensed in the relevant jurisdictions. This document should be reviewed and updated any time the product architecture, data handling practices, or applicable laws materially change.
          </p>
        </section>

      </div>
    </div>
  );
}
