"use client";

import { useState, useEffect, useRef } from "react";

/* ───────── DESIGN TOKENS ───────── */
const T = {
  bg: "#0a0a0a", bg2: "#111111", bg3: "#161616",
  line: "#1f1f1f", line2: "#2a2a2a",
  text: "#f4f4f0", dim: "#8a8a85", mute: "#555550",
  accent: "#13ef93", accentDim: "#0d9b62",
  warn: "#ff7a45", red: "#ff4545",
  serif: "'Instrument Serif', 'Times New Roman', serif",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
};

/* ───────── AGENT DEFINITIONS ───────── */
const AGENTS = [
  {
    id: "sequence",
    num: "01",
    name: "Outbound Sequence Generator",
    short: "Sequence Gen",
    desc: "Multi-touch outbound sequences personalized to target accounts — email, LinkedIn, and call scripts mapped to buyer persona and pain.",
    icon: "⚡",
    fields: [
      { key: "company", label: "Target Company", placeholder: "e.g. Decagon, Five9, Genesys" },
      { key: "persona", label: "Buyer Persona", placeholder: "e.g. VP Engineering, Head of CX, CTO" },
      { key: "pain", label: "Primary Pain Point (optional)", placeholder: "e.g. Latency issues, cost at scale, compliance gaps" },
    ],
    buildPrompt: (f) => `You are a world-class enterprise SDR/AE at Deepgram, the leading voice AI infrastructure company. Deepgram offers: Speech-to-Text (Nova models), Text-to-Speech, Voice Agent API (Flux), Audio Intelligence, and self-hosted deployment options. Key differentiators: sub-300ms real-time latency, lowest cost per minute, self-hosted/on-prem for compliance, custom model training, unified Voice Agent API.

Generate a 5-touch outbound sequence targeting ${f.persona || "a technical buyer"} at ${f.company || "a target company"}.${f.pain ? ` Their likely pain point: ${f.pain}.` : ""}

For each touch, provide:
- **Touch N** (Channel: Email/LinkedIn/Call)
- **Subject line** (for emails)
- **Body** — lead with the prospect's world, not Deepgram. Reference their likely tech stack, scale challenges, or market pressures. Be specific, not generic.
- **CTA** — always a soft ask, never "let me show you a demo"

Style: Conversational, insider-level, zero fluff. Each touch should build on the previous. Touch 1 = pattern interrupt. Touch 3 = social proof. Touch 5 = breakup.

Format the output in clean markdown with clear headers for each touch.`,
  },
  {
    id: "research",
    num: "02",
    name: "Account Research Agent",
    short: "Account Intel",
    desc: "Five-dimension ICP scoring and account intelligence briefing — tech stack, buying signals, competitive landscape, and recommended entry strategy.",
    icon: "◉",
    fields: [
      { key: "company", label: "Company Name", placeholder: "e.g. Retell AI, Talkdesk, Kaiser Permanente" },
      { key: "context", label: "Additional Context (optional)", placeholder: "e.g. Recently raised Series B, hiring for voice engineers" },
    ],
    buildPrompt: (f) => `You are a strategic account researcher at Deepgram. Deepgram sells voice AI infrastructure: STT (Nova), TTS, Voice Agent API (Flux), Audio Intelligence, with self-hosted deployment options. ICP: AI-native voice agent companies, CCaaS platforms, and enterprise verticals (healthcare, finance, gov).

Research and score ${f.company} across 5 dimensions (1-10 each):

1. **Technical Fit** — Do they need real-time STT/TTS? Voice agents? What's their likely current stack?
2. **Scale Potential** — Estimated call/audio volume, growth trajectory, ARR potential for Deepgram
3. **Competitive Position** — Who are they likely using today? Whisper? Google? AssemblyAI? ElevenLabs?
4. **Buying Readiness** — Signals: hiring for voice roles, recent funding, product launches, compliance needs
5. **Strategic Value** — Logo value, case study potential, network effects, partner leverage

${f.context ? `Additional context: ${f.context}` : ""}

Output format:
- **Overall ICP Score: X/50** with a one-line verdict
- Each dimension scored with 2-3 sentences of reasoning
- **Recommended Entry Strategy** — who to target, what motion (PLG, partner, direct), and the opening angle
- **Key Risks** — what could kill this deal
- **Deepgram Products to Lead With** — rank order

Use your best knowledge. Be specific and opinionated, not generic.`,
  },
  {
    id: "battlecard",
    num: "03",
    name: "Competitive Battle Card",
    short: "Battle Cards",
    desc: "Real-time competitive intelligence against any voice AI competitor — objection handling, feature gaps, pricing traps, and win narratives.",
    icon: "◆",
    fields: [
      { key: "competitor", label: "Competitor", placeholder: "e.g. OpenAI Whisper, AssemblyAI, Google STT, ElevenLabs" },
      { key: "scenario", label: "Deal Scenario (optional)", placeholder: "e.g. Enterprise healthcare, real-time agent platform, cost optimization" },
    ],
    buildPrompt: (f) => `You are a competitive intelligence analyst at Deepgram. Generate a battle card against ${f.competitor || "a voice AI competitor"}.${f.scenario ? ` Deal context: ${f.scenario}.` : ""}

Deepgram strengths: sub-300ms real-time STT, lowest cost/min at scale ($0.0043/min), self-hosted deployment, custom model training, unified Voice Agent API (Flux), SOC2/HIPAA compliance, 200K+ developer community, backed by $70M+ in funding.

Structure the battle card as:

**1. Competitor Overview** — What they do, who buys them, their GTM motion
**2. Head-to-Head Comparison** — Table format across: latency, accuracy, pricing, deployment options, API breadth, compliance, TTS quality, custom models
**3. Where They Win** — Be honest about their genuine advantages
**4. Where We Win** — Our differentiated strengths in this matchup
**5. Common Objections & Responses** — Top 5 things a prospect will say about the competitor being better, with specific rebuttals
**6. Trap Questions** — 3 questions to ask the prospect that expose the competitor's weakness
**7. Knockout Blow** — The single most compelling argument to close against this competitor
**8. Proof Points** — Customer stories, benchmarks, or data points that seal it

Be specific and tactical. This is for a rep walking into a deal, not a marketing blog.`,
  },
  {
    id: "roi",
    num: "04",
    name: "ROI Calculator",
    short: "ROI Calc",
    desc: "Build a business case with hard numbers — cost savings, latency improvements, and total cost of ownership vs. current provider.",
    icon: "▲",
    fields: [
      { key: "volume", label: "Monthly Audio Minutes", placeholder: "e.g. 5000000" },
      { key: "current", label: "Current Provider", placeholder: "e.g. Google STT, Whisper, AssemblyAI" },
      { key: "deployment", label: "Deployment Type", placeholder: "Cloud API, Self-hosted, or Hybrid" },
    ],
    buildPrompt: (f) => `You are a solutions engineer at Deepgram building an ROI model for a prospect.

Inputs:
- Monthly audio minutes: ${f.volume || "1,000,000"}
- Current provider: ${f.current || "Google Cloud STT"}
- Deployment preference: ${f.deployment || "Cloud API"}

Deepgram pricing reference (cloud):
- Nova STT real-time: $0.0043/min (pay-as-you-go), volume discounts at scale
- Nova STT batch: $0.0036/min
- TTS: $0.015/1K chars (~$0.0050/min of audio)
- Voice Agent API: Usage-based, typically $0.05-0.08/min all-in

Competitor approximate pricing:
- Google Cloud STT: $0.024/min (standard), $0.009/min (batch)
- AssemblyAI: $0.0065/min (real-time)
- OpenAI Whisper API: $0.006/min (batch only)
- ElevenLabs: $0.30+/min for full agent

Build a comprehensive ROI analysis:

1. **Current State Cost Model** — Monthly and annual spend at current provider
2. **Deepgram Cost Model** — Same volume on Deepgram, showing per-unit and total
3. **Annual Savings** — Dollar amount and percentage
4. **TCO Comparison** — Include integration costs, maintenance, support (Deepgram advantage: single API vs multi-vendor)
5. **Latency ROI** — If real-time: estimate impact of latency improvement on agent handle time, CSAT, completion rates
6. **3-Year Projection** — Show compounding savings as volume grows 20% YoY
7. **Executive Summary** — One paragraph a CFO would read

Format with clear numbers, tables where appropriate. Show your math.`,
  },
  {
    id: "deal-analysis",
    num: "05",
    name: "Deal Analysis (MEDDPIC)",
    short: "Deal Analysis",
    desc: "Scientific deal qualification using the MEDDPIC framework — scores where you stand, surfaces gaps in your deal, and tells you exactly what to do next to improve win probability.",
    icon: "◇",
    fields: [
      { key: "account", label: "Account Name", placeholder: "e.g. Decagon, Five9, Kaiser Permanente" },
      { key: "prospect", label: "Prospect Name & Title (optional)", placeholder: "e.g. Sarah Chen, VP of Engineering" },
      { key: "context", label: "Deal Context (what you know so far)", placeholder: "e.g. Had intro call, they're using Whisper, evaluating for voice agent platform, ~2M minutes/month, no budget confirmed yet" },
    ],
    buildPrompt: (f) => `You are an elite deal strategist and MEDDPIC coach at Deepgram. You have deep knowledge of Deepgram's full product suite, competitive positioning, and sales motion.

**DEEPGRAM PRODUCT KNOWLEDGE:**
- Speech-to-Text (Nova models): Real-time and batch, sub-300ms latency, $0.0043/min, 30+ languages, custom model training
- Text-to-Speech: Natural-sounding voices, low-latency streaming, $0.015/1K chars
- Voice Agent API (Flux): Unified API combining STT + TTS + LLM orchestration into a single endpoint — eliminates multi-vendor stitching
- Audio Intelligence: Summarization, topic detection, sentiment analysis, intent recognition
- Self-hosted deployment: On-prem/VPC for HIPAA, SOC2, FedRAMP compliance requirements
- Custom model training: Domain-specific vocabulary and acoustic models for enterprise accuracy

**DEEPGRAM CUSTOMERS & PROOF POINTS:**
- Twilio (voice infrastructure partner), Sierra (Bret Taylor's AI agent platform), Decagon (AI customer support agents), Cloudflare, IBM, Cresta, Vapi, Daily, Kore.ai, Cognigy, NICE
- 200K+ developers on platform
- Lowest cost per minute in the market at scale
- Only major voice AI provider offering true self-hosted deployment

**DEEPGRAM GTM MOTIONS:**
- PLG/Developer-led: Self-serve sign-up, consumption-based, 14-45 day cycle
- Partner/OEM: Embedded in CCaaS platforms, 90-180 day cycle
- Enterprise Direct: Self-hosted, custom models, 120-240 day cycle, $500K+ ACV

**YOUR TASK:**
Analyze this deal using the MEDDPIC framework and provide a scientific assessment of deal health.

**ACCOUNT:** ${f.account || "Unknown"}
${f.prospect ? `**PROSPECT:** ${f.prospect}` : ""}
${f.context ? `**DEAL CONTEXT:** ${f.context}` : "**DEAL CONTEXT:** No context provided — assess based on what you know about this company and provide assumptions."}

**OUTPUT FORMAT:**

## Deal Health Score: X/100
One-line verdict on deal probability.

## MEDDPIC Analysis

For EACH element, provide:
- **Score (1-10)** with a colored indicator
- **What We Know** — facts from the context provided
- **What We're Missing** — gaps that reduce win probability
- **Action Required** — specific next step to fill the gap

### M — Metrics
What quantifiable business outcomes will the prospect achieve? Do we have hard numbers tied to their pain?

### E — Economic Buyer
Who has the budget and final sign-off authority? Have we identified and accessed this person?

### D — Decision Criteria
What technical and business criteria will they use to evaluate? Are we shaping these criteria in our favor?

### D — Decision Process
What is the buying process, timeline, and sequence of steps to close? Do we know every stage and stakeholder?

### P — Paper Process
What does procurement, legal, and security review look like? What compliance requirements exist (HIPAA, SOC2, FedRAMP)?

### I — Identify Pain
What is the compelling event or pain driving urgency? Is there a cost of inaction?

### C — Champion
Who internally is advocating for Deepgram? Do they have influence, access to the EB, and a personal win tied to this deal?

## Gap Analysis
Rank the top 3 MEDDPIC gaps from most critical to least. For each:
- Why this gap threatens the deal
- The specific action, email, or meeting to close it
- Who on the Deepgram team should be involved (AE, SE, exec sponsor)

## Recommended Next 3 Moves
Concrete, sequenced actions to advance this deal in the next 7-14 days.

## Risk Flags
Red flags that could kill this deal, and mitigation strategies.

## Deepgram Products to Lead With
Based on this account's profile, rank which products to lead with and why.

Be brutally honest. Optimistic deal assessment kills pipelines. Score low where information is missing — "we don't know" is a 2, not a 5.`,
  },
  {
    id: "pitch",
    num: "06",
    name: "Persona Pitch Builder",
    short: "Pitch Builder",
    desc: "Generates persona-specific pitch narratives — CTO gets architecture depth, VP CX gets ROI and outcomes, CEO gets market vision.",
    icon: "◈",
    fields: [
      { key: "persona", label: "Target Persona", placeholder: "e.g. CTO, VP of Product, Head of CX, CEO/Founder" },
      { key: "company", label: "Company", placeholder: "e.g. Vapi, NICE, Humana" },
      { key: "usecase", label: "Primary Use Case", placeholder: "e.g. Voice agents for support, real-time transcription, speech analytics" },
    ],
    buildPrompt: (f) => `You are the Head of GTM at Deepgram preparing a pitch tailored for a ${f.persona || "CTO"} at ${f.company || "a target company"}.${f.usecase ? ` Their primary use case: ${f.usecase}.` : ""}

Deepgram products: Nova STT (real-time + batch), TTS, Voice Agent API (Flux), Audio Intelligence, self-hosted deployment, custom model training. Key proof points: Twilio, Sierra, Decagon, Cloudflare, IBM are customers. Sub-300ms latency, lowest cost/min, 200K+ developers.

Build a persona-specific pitch:

**1. Opening Hook (30 seconds)** — Lead with THEIR world. What keeps this persona up at night? What trend is reshaping their role?

**2. Problem Framing (60 seconds)** — Connect their specific pain to the infrastructure gap. Don't mention Deepgram yet.

**3. Solution Narrative (90 seconds)** — Introduce Deepgram through the lens of what matters to THIS persona:
- CTO → architecture, latency benchmarks, self-hosted, API design
- VP Product → time-to-market, developer experience, feature velocity
- VP/Head of CX → handle time reduction, CSAT improvement, cost per interaction
- CEO/Founder → market positioning, competitive moat, unit economics at scale

**4. Proof Point** — One customer story that mirrors their situation

**5. The Ask** — What's the specific next step for this persona? (Technical eval? Executive briefing? POC?)

**6. Objection Prep** — Top 3 objections this persona will raise, with responses

**7. Leave-Behind** — A one-paragraph summary they can forward internally to champion the deal

Style: Confident, insider-level, no jargon soup. This should feel like a conversation, not a pitch deck read-aloud.`,
  },
  {
    id: "impact",
    num: "07",
    name: "Impact Statement Generator",
    short: "Impact Statement",
    desc: "Generates a polished 4-5 page impact statement — current state analysis, strategic problem, why Deepgram, phased implementation with ROI, and aligned customer stories.",
    icon: "▣",
    fields: [
      { key: "company", label: "Prospect Company", placeholder: "e.g. Allstate, Vapi, UnitedHealth Group" },
      { key: "industry", label: "Industry / Vertical", placeholder: "e.g. Insurance, Voice AI Platform, Healthcare" },
      { key: "pain", label: "Primary Pain / Current State", placeholder: "e.g. Using Google STT at $0.024/min, 5M minutes/month, latency issues on live agents, evaluating alternatives" },
      { key: "contact", label: "Primary Contact & Title (optional)", placeholder: "e.g. James Park, VP of Engineering" },
    ],
    buildPrompt: (f) => `You are a senior strategic Account Executive at Deepgram creating a personalized Impact Statement document for ${f.company || "a prospect"}. This is a polished, executive-ready deliverable — not a pitch deck, not an email. It's a 4-5 page leave-behind that makes the business case for Deepgram in the prospect's specific context.

**DEEPGRAM FULL CONTEXT:**
Products:
- Speech-to-Text (Nova 3): Real-time ($0.0043/min) and batch ($0.0036/min), sub-300ms latency, 30+ languages, custom model training, speaker diarization, smart formatting
- Text-to-Speech (Aura): Natural low-latency voices, streaming output, $0.015/1K characters
- Voice Agent API (Flux): Unified STT + TTS + LLM orchestration — single API replaces multi-vendor stack. Handles end-of-turn detection, interruptions, context management
- Audio Intelligence: Summarization, topic detection, sentiment analysis, intent recognition, entity detection
- Self-hosted deployment: On-prem, VPC, air-gapped environments. HIPAA, SOC2 Type II, GDPR, FedRAMP-ready
- Custom models: Domain-specific vocabulary, acoustic adaptation, enterprise accuracy optimization

Pricing Model:
- Usage-based, pay-as-you-go
- Volume discounts at scale (committed use)
- Self-hosted: Annual license + support
- No per-seat fees, no platform fees

Key Customers: Twilio, Sierra, Decagon, Cloudflare, IBM, Cresta, Vapi, Daily, Kore.ai, Cognigy, NICE, Granola, Coval
Developer Community: 200K+ developers

Competitive Advantages:
- Lowest real-time STT cost in market ($0.0043/min vs Google $0.024/min vs AssemblyAI $0.0065/min)
- Sub-300ms end-to-end latency (purpose-built, not stitched together)
- Only major provider with true self-hosted deployment
- Custom model training for domain-specific accuracy
- Unified Voice Agent API eliminates multi-vendor complexity

**PROSPECT CONTEXT:**
- Company: ${f.company || "Target Company"}
- Industry: ${f.industry || "Technology"}
- Current State / Pain: ${f.pain || "Evaluating voice AI solutions"}
${f.contact ? `- Primary Contact: ${f.contact}` : ""}

**DOCUMENT STRUCTURE — Follow this EXACT format:**

# Deepgram + ${f.company || "Company"} | Impact Statement

## Deepgram + ${f.company || "Company"}
*[One compelling tagline that frames the transformation — e.g., "Turning Voice Infrastructure Into a Competitive Advantage"]*

---

## The Current State

### Where ${f.company || "Company"} Stands Today
Write 2-3 sentences about their current situation based on the context provided. Then create a metrics table:

| Metric | Current State |
|--------|--------------|
| [Relevant volume metric] | [Value] |
| [Current provider/approach] | [Value] |
| [Current cost metric] | [Value] |
| [Current pain metric] | [Value] |

### The Strategic Problem: [Current Approach/Provider]
Explain WHY their current approach is architecturally limited. Frame this the way a consultant would — not as a sales pitch, but as a structural analysis. Include 3-4 bullet points on specific constraints. Reference their specific technology where possible.

**Business Impact:** One hard-hitting paragraph quantifying the cost of inaction.

---

## Why Deepgram

### Built for [Their Specific Use Case]
4-5 bullet points on why Deepgram is the right fit, each with a bold label and a one-sentence explanation. Tailor to their industry and use case.

### Expected Impact
Create a table showing projected improvements:

| Metric | Expected Impact |
|--------|----------------|
| [Cost reduction] | [Specific %] |
| [Latency improvement] | [Specific ms] |
| [Quality/accuracy gain] | [Specific metric] |
| [Time-to-value] | [Implementation timeline] |

---

## The Strategic Solution

### Phase 1: Immediate Value (30 Days)
Describe what gets deployed first. Include a comparison table:

| Metric | Current State | Phase 1 Target |
|--------|--------------|----------------|
| [Key metric 1] | [Current] | [Target] |
| [Key metric 2] | [Current] | [Target] |
| [Key metric 3] | [Current] | [Target] |

**Phase 1 Economics:** One paragraph showing this is net-positive from Day 1.

### Phase 2: Full Deployment (60-90 Days)
Describe expanded capabilities, integrations, and advanced features.

**Phase 2 Economics:** One paragraph on expanded ROI.

---

## Success Stories: Proof This Works

### Case Study 1: [Most relevant customer]
**Company Overview:** [One line — industry, scale, use case]

| Metric | Result |
|--------|--------|
| [Key result 1] | [Value] |
| [Key result 2] | [Value] |
| [Key result 3] | [Value] |

### Case Study 2: [Second relevant customer]
Same format.

### Case Study 3: [Third relevant customer]
Same format.

Choose case studies that mirror the prospect's industry, scale, or use case. Use real Deepgram customers (Twilio, Sierra, Decagon, Cloudflare, IBM, Cresta, Vapi, etc.) and construct plausible results based on Deepgram's known differentiators (cost savings, latency, accuracy). Flag any metrics you're estimating vs. confirmed.

---

*Deepgram Impact Statement | Confidential | April 2026*

**STYLE REQUIREMENTS:**
- Write like a management consultant, not a salesperson
- Lead with the prospect's world, not Deepgram's features
- Every section should feel researched and specific to THIS company
- Tables should have real numbers — estimate intelligently based on context, flag assumptions
- The document should be something a champion can forward to their CFO and feel proud of
- Total length: 4-5 pages equivalent in markdown
- Professional, confident, zero fluff`,
  },
];

/* ───────── WAVEFORM ───────── */
function Waveform({ width = 200, height = 40, bars = 30, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, width, height, opacity: 0.4, ...style }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 1, background: T.accent,
          animation: `wave ${0.8 + Math.random() * 1.2}s ease-in-out ${i * 0.04}s infinite`,
        }} />
      ))}
      <style>{`@keyframes wave { 0%,100%{height:18%} 50%{height:100%} }`}</style>
    </div>
  );
}

/* ───────── MARKDOWN RENDERER ───────── */
function renderInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;
  const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) parts.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>);
    if (match[2]) parts.push(<strong key={key++} style={{ color: T.text, fontWeight: 600 }}>{match[2]}</strong>);
    else if (match[4]) parts.push(<code key={key++} style={{ fontFamily: T.mono, fontSize: "0.88em", background: T.bg3, padding: "2px 6px", borderRadius: 3, color: T.accent }}>{match[4]}</code>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < remaining.length) parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
  return parts.length > 0 ? parts : text;
}

function TableRenderer({ lines }) {
  const rows = lines.filter((l) => !l.match(/^\|[\s-:|]+\|$/));
  const parseRow = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
  if (rows.length === 0) return null;
  const header = parseRow(rows[0]);
  const body = rows.slice(1).map(parseRow);
  return (
    <div style={{ overflowX: "auto", margin: "16px 0", border: `1px solid ${T.line}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr>{header.map((h, i) => (<th key={i} style={{ textAlign: "left", padding: "12px 16px", background: T.bg3, fontFamily: T.mono, fontSize: 11, color: T.dim, letterSpacing: "0.04em", fontWeight: 500, borderBottom: `1px solid ${T.line}`, borderRight: i < header.length - 1 ? `1px solid ${T.line}` : "none" }}>{renderInline(h)}</th>))}</tr></thead>
        <tbody>{body.map((row, ri) => (<tr key={ri}>{row.map((cell, ci) => (<td key={ci} style={{ padding: "10px 16px", borderBottom: `1px solid ${T.line}`, borderRight: ci < row.length - 1 ? `1px solid ${T.line}` : "none", color: T.dim }}>{renderInline(cell)}</td>))}</tr>))}</tbody>
      </table>
    </div>
  );
}

function MarkdownRenderer({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.text, margin: "28px 0 8px" }}>{renderInline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 400, color: T.text, margin: "36px 0 12px" }}>{renderInline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} style={{ fontFamily: T.serif, fontSize: 30, fontWeight: 400, color: T.text, margin: "40px 0 14px" }}>{renderInline(line.slice(2))}</h2>);
    } else if (line.startsWith("---") || line.startsWith("***")) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: `1px solid ${T.line}`, margin: "28px 0" }} />);
    } else if (line.startsWith("| ")) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
      i--;
      elements.push(<TableRenderer key={i} lines={tableLines} />);
    } else if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].replace(/^[-*] /, "")); i++; }
      i--;
      elements.push(<ul key={i} style={{ margin: "8px 0", paddingLeft: 0, listStyle: "none" }}>{items.map((item, j) => (<li key={j} style={{ padding: "6px 0", borderBottom: `1px solid ${T.line}`, display: "flex", gap: 12, fontSize: 14, lineHeight: 1.55 }}><span style={{ color: T.accent, flexShrink: 0 }}>→</span><span>{renderInline(item)}</span></li>))}</ul>);
    } else if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      i--;
      elements.push(<ol key={i} style={{ margin: "8px 0", paddingLeft: 0, listStyle: "none" }}>{items.map((item, j) => (<li key={j} style={{ padding: "6px 0", borderBottom: `1px solid ${T.line}`, display: "flex", gap: 12, fontSize: 14, lineHeight: 1.55 }}><span style={{ fontFamily: T.mono, fontSize: 11, color: T.mute, flexShrink: 0, minWidth: 20, paddingTop: 2 }}>{j + 1}.</span><span>{renderInline(item)}</span></li>))}</ol>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else {
      elements.push(<p key={i} style={{ margin: "6px 0", fontSize: 14, lineHeight: 1.65 }}>{renderInline(line)}</p>);
    }
    i++;
  }
  return <>{elements}</>;
}

/* ───────── AGENT PAGE ───────── */
function AgentPage({ agent }) {
  const [fields, setFields] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);

  const updateField = (key, val) => setFields((p) => ({ ...p, [key]: val }));

  const runAgent = async () => {
    setLoading(true);
    setOutput("");
    setError("");
    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: agent.buildPrompt(fields) }),
      });
      const data = await resp.json();
      if (data.output) {
        setOutput(data.output);
      } else {
        setError(data.error || "No response received.");
      }
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [output]);

  const hasInput = agent.fields.some((f) => fields[f.key]?.trim());

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "80px 0 60px", borderBottom: `1px solid ${T.line}`, position: "relative" }}>
        <div style={{ position: "absolute", right: 0, top: 90 }}><Waveform width={200} height={40} bars={28} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <span style={{ fontFamily: T.mono, fontSize: 24, color: T.accent }}>{agent.icon}</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.08em" }}>AGENT {agent.num}</span>
        </div>
        <h1 style={{ fontFamily: T.serif, fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 16 }}>{agent.name}</h1>
        <p style={{ fontSize: 17, color: T.dim, lineHeight: 1.55, maxWidth: 640, fontWeight: 300 }}>{agent.desc}</p>
      </div>

      <div style={{ padding: "48px 0" }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mute, letterSpacing: "0.08em", marginBottom: 28 }}>INPUT PARAMETERS</div>
        <div style={{ display: "grid", gridTemplateColumns: agent.fields.length > 2 ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 36 }}>
          {agent.fields.map((f) => (
            <div key={f.key}>
              <label style={{ display: "block", fontFamily: T.mono, fontSize: 11, color: T.dim, letterSpacing: "0.04em", marginBottom: 8 }}>{f.label}</label>
              <input
                value={fields[f.key] || ""}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={{ width: "100%", padding: "14px 16px", background: T.bg2, border: `1px solid ${T.line}`, color: T.text, fontFamily: T.sans, fontSize: 15, outline: "none", transition: "border 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = T.accentDim}
                onBlur={(e) => e.target.style.borderColor = T.line}
              />
            </div>
          ))}
        </div>
        <button
          onClick={runAgent}
          disabled={loading || !hasInput}
          style={{
            fontFamily: T.mono, fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", padding: "14px 36px",
            background: loading ? T.bg3 : hasInput ? T.accent : T.bg3,
            color: loading ? T.dim : hasInput ? T.bg : T.mute,
            border: `1px solid ${loading ? T.line : hasInput ? T.accent : T.line}`,
            cursor: loading || !hasInput ? "not-allowed" : "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          {loading && <span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${T.mute}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
          {loading ? "GENERATING..." : "RUN AGENT →"}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </button>
      </div>

      {error && <div style={{ padding: 20, background: "rgba(255,69,69,0.08)", border: `1px solid rgba(255,69,69,0.2)`, fontFamily: T.mono, fontSize: 13, color: T.red, marginBottom: 24 }}>{error}</div>}

      {(output || loading) && (
        <div ref={outputRef} style={{ borderTop: `1px solid ${T.line}`, paddingTop: 48 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.08em", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}`, animation: loading ? "pulse 1.5s ease-in-out infinite" : "none" }} />
            {loading ? "PROCESSING..." : "OUTPUT"}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
          </div>
          {loading && !output ? (
            <div style={{ padding: 40, background: T.bg2, border: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 0.7, 0.85, 0.5].map((w, i) => (<div key={i} style={{ height: 14, background: T.bg3, borderRadius: 2, width: `${w * 100}%`, animation: `shimmer 1.5s ease-in-out ${i * 0.15}s infinite` }} />))}
              </div>
              <style>{`@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
            </div>
          ) : output ? (
            <div style={{ padding: 36, background: T.bg2, border: `1px solid ${T.line}`, position: "relative" }}>
              <button onClick={() => navigator.clipboard?.writeText(output)} style={{ position: "absolute", top: 16, right: 16, fontFamily: T.mono, fontSize: 10, padding: "5px 12px", background: T.bg3, border: `1px solid ${T.line2}`, color: T.dim, cursor: "pointer", borderRadius: 3 }}>COPY</button>
              <div style={{ fontFamily: T.sans, fontSize: 15, lineHeight: 1.7, color: T.dim, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                <MarkdownRenderer text={output} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ───────── HOME PAGE ───────── */
function HomePage({ onNavigate }) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "100px 0 80px", borderBottom: `1px solid ${T.line}`, position: "relative" }}>
        <div style={{ position: "absolute", right: 0, top: 110 }}><Waveform width={260} height={50} bars={35} /></div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mute, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 40, display: "flex", gap: 24 }}>
          <span style={{ color: T.accent }}>◆</span><span>GTM COMMAND CENTER</span>
          <span style={{ color: T.accent }}>◆</span><span>7 AI AGENTS</span>
          <span style={{ color: T.accent }}>◆</span><span>READY TO DEPLOY</span>
        </div>
        <h1 style={{ fontFamily: T.serif, fontSize: "clamp(48px, 8vw, 108px)", fontWeight: 400, lineHeight: 0.92, letterSpacing: "-0.03em", marginBottom: 28 }}>
          Deepgram<br /><em style={{ fontStyle: "italic", color: T.accent }}>GTM Hub.</em>
        </h1>
        <p style={{ maxWidth: 600, fontSize: 18, lineHeight: 1.6, color: T.dim, fontWeight: 300, marginBottom: 48 }}>Seven AI-powered agents built to accelerate every stage of the Deepgram sales cycle — from account research to deal analysis to closed-won.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          {[["7", "AI Agents Live"], ["< 30s", "Time to Output"], ["∞", "Sequences Generated"]].map(([num, label], i) => (
            <div key={i} style={{ padding: "24px 20px", borderRight: i < 2 ? `1px solid ${T.line}` : "none" }}>
              <div style={{ fontFamily: T.serif, fontSize: 42, lineHeight: 1, marginBottom: 6 }}>{num}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mute }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "80px 0 0" }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.08em", marginBottom: 12 }}>§ AGENTS</div>
        <h2 style={{ fontFamily: T.serif, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 56 }}>
          Your AI sales team — <em style={{ fontStyle: "italic", color: T.dim }}>deploy day one.</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {AGENTS.map((agent) => (
            <div key={agent.id} onClick={() => onNavigate(agent.id)} style={{ background: T.bg2, border: `1px solid ${T.line}`, padding: 32, cursor: "pointer", transition: "all 0.3s", position: "relative", overflow: "hidden" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accentDim; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ position: "absolute", top: 28, right: 32, fontFamily: T.serif, fontSize: 56, lineHeight: 1, color: T.line2 }}>{agent.num}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontFamily: T.mono, fontSize: 18, color: T.accent }}>{agent.icon}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, letterSpacing: "0.08em" }}>AGENT {agent.num}</span>
              </div>
              <h3 style={{ fontFamily: T.serif, fontSize: 28, lineHeight: 1.1, marginBottom: 10, fontWeight: 400, maxWidth: "80%" }}>{agent.name}</h3>
              <p style={{ fontSize: 14, color: T.dim, lineHeight: 1.55, maxWidth: "90%" }}>{agent.desc}</p>
              <div style={{ marginTop: 24, fontFamily: T.mono, fontSize: 11, color: T.accent, display: "flex", alignItems: "center", gap: 8 }}>LAUNCH AGENT <span style={{ fontSize: 14 }}>→</span></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 80, padding: 48, background: `linear-gradient(135deg, rgba(19,239,147,0.06) 0%, ${T.bg2} 100%)`, border: `1px solid ${T.accent}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)" }}><Waveform width={180} height={36} bars={25} /></div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.08em", marginBottom: 12 }}>§ GTM PLAYBOOK</div>
        <h3 style={{ fontFamily: T.serif, fontSize: 36, fontWeight: 400, lineHeight: 1.1, marginBottom: 12, maxWidth: "70%" }}>The full go-to-market strategy</h3>
        <p style={{ fontSize: 15, color: T.dim, marginBottom: 24, maxWidth: "60%" }}>Market thesis, ICP tiering, competitive matrix, GTM motions, named accounts, and a 30/60/90 execution plan.</p>
        <button onClick={() => onNavigate("playbook")} style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: "0.02em", padding: "12px 28px", background: T.accent, color: T.bg, border: "none", cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#1fff9f"}
          onMouseLeave={(e) => e.currentTarget.style.background = T.accent}>
          VIEW PLAYBOOK →
        </button>
      </div>
    </div>
  );
}

/* ───────── SECTION HEADER ───────── */
function SectionHeader({ num, title, subtitle }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 40, padding: "80px 0 48px", borderTop: `1px solid ${T.line}`, alignItems: "baseline" }}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.08em" }}>§ {num}</div>
      <div>
        <h2 style={{ fontFamily: T.serif, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: T.serif, fontSize: 22, color: T.dim, fontStyle: "italic", marginTop: 8 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

/* ───────── PLAYBOOK PAGE ───────── */
function PlaybookPage() {
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "80px 0 60px", borderBottom: `1px solid ${T.line}`, position: "relative" }}>
        <div style={{ position: "absolute", right: 0, top: 90 }}><Waveform width={260} height={50} bars={35} /></div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mute, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 32, display: "flex", gap: 24 }}>
          {["Voice AI Infrastructure", "Enterprise + Developer GTM", "Confidential"].map((t, i) => (<span key={i}><span style={{ color: T.accent }}>◆ </span>{t}</span>))}
        </div>
        <h1 style={{ fontFamily: T.serif, fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 400, lineHeight: 0.92, letterSpacing: "-0.03em", marginBottom: 24 }}>
          The Voice AI<br />economy runs<br />on <em style={{ fontStyle: "italic", color: T.accent }}>Deepgram.</em>
        </h1>
        <p style={{ maxWidth: 620, fontSize: 18, lineHeight: 1.6, color: T.dim, fontWeight: 300 }}>A go-to-market playbook for capturing the next wave of voice infrastructure spend.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid ${T.line}` }}>
        {[["$47B", "Voice AI TAM by 2030"], ["3", "GTM Motions"], ["$1B+", "Funding Raised"], ["200K+", "Developers"]].map(([n, l], i) => (
          <div key={i} style={{ padding: "28px 24px", borderRight: i < 3 ? `1px solid ${T.line}` : "none" }}>
            <div style={{ fontFamily: T.serif, fontSize: 44, lineHeight: 1, marginBottom: 8 }}>{n}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mute }}>{l}</div>
          </div>
        ))}
      </div>

      <SectionHeader num="01" title="Market Thesis" subtitle="Voice is the next interface — and the infrastructure layer is being rewritten." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, padding: "0 0 80px" }}>
        <div>
          <p style={{ fontFamily: T.serif, fontSize: 26, lineHeight: 1.4, marginBottom: 20 }}>Every meaningful product surface is becoming a voice surface. The question isn't <em style={{ color: T.accent, fontStyle: "italic" }}>whether</em> to add voice — it's which infrastructure stack carries that load.</p>
          <p style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.45, color: T.dim }}>Whisper democratized STT. ElevenLabs commoditized synthesis. What's scarce is a unified, low-latency, enterprise-grade stack.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: T.line, border: `1px solid ${T.line}` }}>
          {[["Latency is the moat", "Sub-300ms end-to-end is table stakes. Deepgram's architecture is purpose-built."],
            ["Self-hosted unlocks enterprise", "Healthcare, banking, gov — largest voice budgets sit behind compliance gates."],
            ["Unit economics decide winners", "A 30% cost-per-minute advantage compounds into category capture."],
            ["Platform play eats point solutions", "Buyers consolidating from 3-vendor stacks to a single Voice Agent API."]
          ].map(([title, desc], i) => (
            <div key={i} style={{ background: T.bg2, padding: 24 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, marginBottom: 6 }}>PILLAR · 0{i + 1}</div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6, color: T.text }}>{title}</div>
              <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionHeader num="02" title="ICP & Account Tiering" subtitle="Three tiers. Three buying motions." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, paddingBottom: 80 }}>
        {[
          { tag: "TIER 01 / STRATEGIC", acv: "$500K–$5M+", name: "AI-Native Voice Platforms", desc: "Companies whose entire product is voice agents.", accounts: ["Decagon", "Sierra", "Vapi", "Cresta", "Replicant", "Bland"], criteria: ["10M+ min/month", "Series B+", "Voice is core product", "Latency is moat"], featured: true },
          { tag: "TIER 02 / EXPANSION", acv: "$150K–$750K", name: "CCaaS & Contact Center", desc: "Established platforms embedding voice AI.", accounts: ["Twilio", "Cognigy", "Kore.ai", "NICE", "Genesys", "Five9"], criteria: ["Existing CC base", "Voice AI roadmap", "OEM partnership fit", "Multi-region deploy"] },
          { tag: "TIER 03 / VERTICAL", acv: "$250K–$2M+", name: "Enterprise Verticals", desc: "Healthcare, finance, gov — compliance justifies premium.", accounts: ["Healthcare", "Telehealth", "Banking", "Insurance", "Public Sector"], criteria: ["HIPAA/SOC2/FedRAMP", "Self-hosted deploy", "Voice at scale", "$10M+ CC spend"] },
        ].map((tier, i) => (
          <div key={i} style={{ background: tier.featured ? `linear-gradient(180deg, rgba(19,239,147,0.05) 0%, ${T.bg2} 100%)` : T.bg2, border: `1px solid ${tier.featured ? T.accent : T.line}`, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 16, marginBottom: 20, borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent }}>{tier.tag}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mute }}>{tier.acv}</span>
            </div>
            <h3 style={{ fontFamily: T.serif, fontSize: 26, lineHeight: 1.1, marginBottom: 10, fontWeight: 400 }}>{tier.name}</h3>
            <p style={{ fontSize: 13, color: T.dim, marginBottom: 20, lineHeight: 1.5 }}>{tier.desc}</p>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.mute, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>ACCOUNTS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
              {tier.accounts.map((a) => (<span key={a} style={{ fontFamily: T.mono, fontSize: 10, padding: "3px 8px", background: T.bg3, border: `1px solid ${T.line2}`, borderRadius: 100, color: T.text }}>{a}</span>))}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.mute, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>CRITERIA</div>
            {tier.criteria.map((c, j) => (<div key={j} style={{ padding: "6px 0", borderBottom: `1px solid ${T.line}`, fontSize: 12, color: T.dim, display: "flex", gap: 10 }}><span style={{ color: T.accent }}>→</span>{c}</div>))}
          </div>
        ))}
      </div>

      <SectionHeader num="03" title="GTM Motions" subtitle="Three plays, run in parallel." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingBottom: 80 }}>
        {[
          { num: "01", tag: "PLG", title: "Build with APIs", desc: "Self-serve → free credits → consumption expansion.", cycle: "14–45d", owner: "SDR+AE", metric: "<6mo CAC" },
          { num: "02", tag: "PARTNER", title: "Integrate Deepgram", desc: "Embedded distribution through CCaaS and telephony.", cycle: "90–180d", owner: "Partner+AE", metric: "10–50× ARR" },
          { num: "03", tag: "ENTERPRISE", title: "Custom & Self-Hosted", desc: "Direct sales into regulated verticals. Self-hosted is the unlock.", cycle: "120–240d", owner: "AE+SE", metric: "$500K+ ACV" },
          { num: "04", tag: "EXPANSION", title: "Wallet Share Growth", desc: "Land on STT, expand to TTS → Voice Agent API → Audio Intel.", cycle: "Ongoing", owner: "CSM+AE", metric: "140% NRR" },
        ].map((m, i) => (
          <div key={i} style={{ background: T.bg2, border: `1px solid ${T.line}`, padding: 32, position: "relative" }}>
            <div style={{ position: "absolute", top: 28, right: 32, fontFamily: T.serif, fontSize: 56, lineHeight: 1, color: T.line2 }}>{m.num}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, marginBottom: 14 }}>{m.tag}</div>
            <h3 style={{ fontFamily: T.serif, fontSize: 28, lineHeight: 1.1, marginBottom: 12, fontWeight: 400, maxWidth: "80%" }}>{m.title}</h3>
            <p style={{ fontSize: 14, color: T.dim, lineHeight: 1.55, marginBottom: 24 }}>{m.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
              {[["Cycle", m.cycle], ["Owner", m.owner], ["Target", m.metric]].map(([l, v], j) => (
                <div key={j}><div style={{ fontFamily: T.mono, fontSize: 9, color: T.mute, textTransform: "uppercase", marginBottom: 4 }}>{l}</div><div style={{ fontFamily: T.mono, fontSize: 12 }}>{v}</div></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionHeader num="04" title="30·60·90 Plan" subtitle="Ramp without losing the quarter." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, border: `1px solid ${T.line}`, marginBottom: 80 }}>
        {[
          { day: "DAY 01–30", title: "Listen.", theme: "LEARN", items: ["Tech certification on full stack", "Shadow 10+ active opps", "Interview 5 won / 5 lost", "Audit pipeline by tier", "Build internal relationships"] },
          { day: "DAY 31–60", title: "Build.", theme: "PIPELINE", items: ["20 net-new Tier-1 opps", "5 CCaaS partner conversations", "First POV pitch with SE", "Convert 3 self-serve → managed", "Publish vertical POV"] },
          { day: "DAY 61–90", title: "Close.", theme: "PROVE", items: ["Close $150K+ ACV deal", "3 opps to procurement", "1 partner agreement signed", "Forecast model built", "GTM POV to leadership"] },
        ].map((phase, i) => (
          <div key={i} style={{ padding: 32, borderRight: i < 2 ? `1px solid ${T.line}` : "none", background: T.bg2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent, boxShadow: `0 0 0 3px rgba(19,239,147,0.15)` }} />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{phase.day}</span>
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 32, lineHeight: 1, marginBottom: 6 }}>{phase.title}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>{phase.theme}</div>
            {phase.items.map((item, j) => (
              <div key={j} style={{ padding: "10px 0", borderBottom: `1px solid ${T.line}`, fontSize: 13, color: T.dim, display: "flex", gap: 10 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mute, flexShrink: 0, minWidth: 16 }}>{j + 1}</span>{item}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: T.line, border: `1px solid ${T.line}` }}>
        {[["Pipeline", "4×", "Coverage per quarter"], ["Tier-1 ACV", "$500K+", "Strategic accounts floor"], ["NRR", "140%", "Expansion-driven"], ["PLG Conv.", "12%", "Self-serve → managed"]].map(([l, v, n], i) => (
          <div key={i} style={{ background: T.bg2, padding: "28px 24px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mute, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>{l}</div>
            <div style={{ fontFamily: T.serif, fontSize: 48, lineHeight: 1, marginBottom: 10 }}>{v}</div>
            <div style={{ fontSize: 11, color: T.dim }}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "64px 0 0", color: T.mute, fontFamily: T.mono, fontSize: 10, letterSpacing: "0.05em" }}>
        DEEPGRAM · GTM PLAYBOOK · v1.0 · APRIL 2026 · PREPARED BY <span style={{ color: T.accent }}>RYAN</span>
      </div>
    </div>
  );
}

/* ───────── NAV STYLES ───────── */
const navBtn = (active) => ({
  fontFamily: T.mono, fontSize: 11, letterSpacing: "0.02em",
  padding: "6px 14px", borderRadius: 4,
  background: active ? "rgba(19,239,147,0.1)" : "transparent",
  color: active ? T.accent : T.dim,
  border: active ? "1px solid rgba(19,239,147,0.2)" : "1px solid transparent",
  cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
});

/* ───────── MAIN APP ───────── */
export default function Home() {
  const [page, setPage] = useState("home");

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentAgent = AGENTS.find((a) => a.id === page);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, WebkitFontSmoothing: "antialiased", position: "relative" }}>
      {/* Grain */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.3, zIndex: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Top Bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.88)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div onClick={() => navigate("home")} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.mono, fontSize: 12, fontWeight: 500, cursor: "pointer", color: T.text }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, boxShadow: `0 0 10px ${T.accent}` }} />
            <span>DEEPGRAM / GTM_HUB</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", overflowX: "auto" }}>
            <button style={navBtn(page === "home")} onClick={() => navigate("home")}>Hub</button>
            {AGENTS.map((a) => (<button key={a.id} style={navBtn(page === a.id)} onClick={() => navigate(a.id)}>{a.short}</button>))}
            <button style={{ ...navBtn(page === "playbook"), ...(page !== "playbook" ? { borderColor: "rgba(19,239,147,0.15)", color: T.accent } : {}) }} onClick={() => navigate("playbook")}>Playbook</button>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mute }}>APR 2026</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 2 }}>
        {page === "home" && <HomePage onNavigate={navigate} />}
        {page === "playbook" && <PlaybookPage />}
        {currentAgent && <AgentPage agent={currentAgent} />}
      </div>
    </div>
  );
}
