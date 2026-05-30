# BMad Method Deep Dive: What Actually Matters for OpenClaw
## For Xavier Finch — May 21, 2026

---

## The Real Insight: BMad Is a "Cognitive Prosthetic"

BMad isn't just documentation or process. It's a **systematic approach to compensating for AI limitations**—specifically the exact failures I exhibit:

- **Narrative lock-in** (first plausible story becomes truth)
- **Evidence amnesia** (don't write down why I ruled something out)
- **Confirmation bias** (hunt for evidence that supports my theory)
- **Context collapse** (forgetting what's in scope)

BMad solves these with **structured disciplines**, not better prompting.

---

## The 5 Most Important BMad Concepts for OpenClaw

### 1. **Named Agents as Cognitive Roles**

**What It Is:**
BMad doesn't have "the AI." It has 6 named agents with distinct personas:

| Agent | Role | Triggers |
|-------|------|----------|
| **Mary** (Business Analyst) | Analysis, research, brainstorming | BP, MR, DR, TR, CB, WB |
| **John** (Product Manager) | Planning, PRDs, epics/stories | CP, VP, EP, CE, IR |
| **Winston** (Architect) | Solutioning, technical decisions | CA, IR |
| **Amelia** (Senior Engineer) | Implementation, code, review | DS, QD, QA, CR, SP |
| **Sally** (UX Designer) | User experience, design | CU |
| **Paige** (Technical Writer) | Documentation, diagrams | DP, WD, US, MG |

**Why This Matters for OpenClaw:**

You don't have "Daequan." You have **roles I should adopt** depending on the task:

- **Research/Discovery** → Mary mode: Check multiple sources, don't assume
- **Planning** → John mode: Write the PRD before building
- **Building** → Amelia mode: Implement, then checkpoint review
- **Debugging** → Forensic mode: Evidence first, hypothesis second

**The Activation Flow** (what happens when you invoke an agent):
1. Resolve agent config (merge shipped + team + personal overrides)
2. Execute prepend steps (pre-flight checks)
3. Adopt persona (identity + role + principles)
4. **Load persistent facts** (org rules, project context)
5. Load config (user name, language, paths)
6. Greet (personalized, with emoji prefix)
7. Execute append steps (post-greet setup)
8. Dispatch or present menu

**Critical:** Step 4 loads `project-context.md` automatically. This is the "don't forget" hook.

---

### 2. **Project Context as "Constitutional Memory"**

**What It Is:**
A file at `_bmad-output/project-context.md` that acts as a "constitution" for the project. Loaded by every implementation workflow.

**What Goes In It:**
```yaml
---
project_name: 'Daequan OpenClaw'
user_name: 'Xavier'
date: '2026-05-21'
sections_completed: ['active_systems', 'lookup_rules', 'failure_patterns']
---

# Active Systems (CHECK BEFORE SUGGESTING)
| System | Status | Location | Last Updated |
|--------|--------|----------|--------------|
| Plaud Webhook | LIVE | `plaud-webhook/` | 2026-02-22 |
| Comcast CRM | LIVE | `comcast-crm/`, `app/comcast/` | 2026-02-27 |
| WhatsApp Primary | LIVE | Channel config | 2026-03-23 |
| Email Priority Monitor | LIVE | `scripts/email-priority-monitor.sh` | 2026-02-18 |

# Contact Lookup Rules (TRY ALL BEFORE "NOT FOUND")
1. GHL (TTL sub-account: mhvGjZGZPcsK3vgjEDwI)
2. GHL (Comcast sub-account: nPubo6INanVq94ovAQNW)
3. SQLite (`comcast-crm/comcast.db`)
4. Email search
5. Kanban files (`kanban-*.md`)

# Critical Rules (VIOLATE AT YOUR PERIL)
- **Rule 1:** Before suggesting ANY solution, search memory/index.md
- **Rule 2:** When Xavier says "check again" → re-query with DIFFERENT parameters
- **Rule 3:** When Xavier tells you where to look → look THERE first
- **Rule 4:** Accept "no results" as SUSPICIOUS when Xavier asks for a specific contact
- **Rule 5:** One search is never enough. Try variations (full name, first name, company, email domain)

# Technology Stack
- OpenClaw (host: Xavier's Mac mini)
- Next.js 15 (daequanai.com)
- Flask (Railway API)
- MongoDB (Railway)
- SQLite (local)
- GHL (GoHighLevel)

# Decision Log (WHY we chose this)
| Decision | Date | Rationale |
|----------|------|-----------|
| Railway over Vercel | 2026-02 | Need persistent SQLite + MongoDB |
| SQLite + MongoDB | 2026-03 | SQLite for local cache, Mongo for web API |
| WhatsApp primary | 2026-03 | Meta Ray-Ban glasses interface |
```

**Why This Fixes My Failures:**

Instead of "remembering" (which I can't do), I **load** the context every session. The rules are explicit constraints, not suggestions.

---

### 3. **Evidence Grading (Forensic Investigation)**

**What It Is:**
A discipline for debugging/investigation where every finding is graded:

- **Confirmed:** Directly observed (logs, code, dumps). Cited with path:line, timestamp, commit hash.
- **Deduced:** Logically follows from confirmed evidence. Reasoning chain shown.
- **Hypothesized:** Plausible but unconfirmed. States what evidence would confirm/refute.

**The Method:**
1. **Stronghold First:** Start from one piece of confirmed evidence, expand outward
2. **Hypothesis Discipline:** Never delete hypotheses—update status (Open → Confirmed/Refuted)
3. **Challenge the Premise:** Question the framing, not just the details

**Why This Matters for OpenClaw:**

When you say "the exports page isn't working," my failure mode is:
- Assume it's a code issue
- Suggest checking Railway
- Miss that the page exists but isn't deployed

Evidence grading would force me to:
1. **Confirm:** The page exists at `app/comcast/exports/page.tsx` ✓
2. **Confirm:** The domain returns 404 ✓
3. **Deduce:** The page exists but isn't being served
4. **Hypothesize:** Railway is serving wrong service, OR domain misconfigured, OR deployment failed
5. **Test:** Check what's deployed to Railway

**The Case File Pattern:**
Every investigation produces a document another engineer (or me, later) can pick up cold. No "I already checked that" without evidence.

---

### 4. **Adversarial Review**

**What It Is:**
A review technique where the reviewer **must find issues**. No "looks good" allowed.

**Core Rule:** Zero findings triggers a halt—re-analyze or explain why.

**Why It Works:**
- Breaks confirmation bias (can't approve until you've looked hard enough)
- Forces thoroughness
- Catches missing things ("What's not here?")

**The Pattern:**
Instead of: "The authentication implementation looks reasonable. Approved."

Produces:
- **HIGH** - `login.ts:47` - No rate limiting on failed attempts
- **HIGH** - Session token stored in localStorage (XSS vulnerable)
- **MEDIUM** - Password validation happens client-side only
- **MEDIUM** - No audit logging for failed login attempts
- **LOW** - Magic number 3600 should be `SESSION_TIMEOUT_SECONDS`

**OpenClaw Application:**

Before I declare a task "done," run adversarial review on myself:

**Checklist for Every Task:**
- [ ] Did I check if this already exists in memory?
- [ ] Did I try multiple search variations for contacts?
- [ ] Did I check the data source Xavier specified?
- [ ] Did I verify the solution works (not just "should work")?
- [ ] Did I document what I changed?
- [ ] Did I check for side effects?

**Human Filtering Required:**
I will find false positives (nitpicks, misunderstandings, hallucinated concerns). You decide what's real.

---

### 5. **Checkpoint Preview**

**What It Is:**
A human-in-the-loop review workflow that walks you through a code change **in an order designed for comprehension**, not git diff order.

**The 5 Steps:**
1. **Orientation:** One-line intent summary + surface area stats (files changed, modules touched, boundary crossings)
2. **Walkthrough:** Organized by concern (not file). "Input validation" → "API contract" → "Error handling"
3. **Detail Pass:** 2-5 specific spots flagged for attention
4. **Testing:** What was tested, what wasn't, edge cases
5. **Wrap-Up:** Ship, rework, or dig deeper?

**Why This Matters:**

Git diffs present changes in file order, which is almost never the order that builds understanding. You see a helper function before you know why it exists.

**OpenClaw Application:**

Before I say "done," I should produce a checkpoint preview:

```
## Orientation
- Intent: Fix daequanai.com/comcast/exports 404 error
- Files touched: 0 (diagnosis only)
- Surface area: Deployment/domain configuration
- Boundary crossings: Railway ↔ Cloudflare DNS

## Walkthrough
1. **The page exists:** `app/comcast/exports/page.tsx` is present in Next.js app
2. **The domain fails:** `daequanai.com/comcast/exports` returns Railway 404
3. **Root cause:** Railway service is not serving the Next.js app (Flask API only)

## Detail Pass
- [ ] Verify Railway service configuration
- [ ] Check Cloudflare DNS CNAME record
- [ ] Confirm which service should serve `daequanai.com`

## Testing
- Cannot test fix without Railway access
- Manual verification required post-fix

## Recommendation
Need Xavier to check Railway dashboard or provide CLI access.
```

---

## Secondary Features Worth Adopting

### Party Mode
**What:** All agents in one conversation. PM, Architect, Dev, UX discuss together.

**Use Case for OpenClaw:**
When you're unsure about a direction, I could adopt multiple personas:
- **PM:** "What's the user value?"
- **Architect:** "What's the technical cost?"
- **Dev:** "What's the implementation path?"

Instead of me giving one answer, I present tradeoffs from multiple angles.

### Quick Dev
**What:** Intent → Spec → Implement → Review, with minimal turns.

**Core Design:**
1. Compress intent first (coherent goal, no contradictions)
2. Route to smallest safe path
3. Run longer unsupervised
4. Diagnose failure at right layer
5. Bring human back only when needed

**Use Case:** Small fixes where full BMad process is overkill.

### Document Sharding
**What:** Split large docs by level-2 headings, create index.

**Use Case:** Split MEMORY.md into:
- `memory/systems/plaud.md`
- `memory/systems/comcast-crm.md`
- `memory/systems/whatsapp.md`
- `memory/decisions/architecture.md`
- `memory/patterns/lookup-rules.md`
- `memory/index.md` (table of contents)

Workflows auto-discover both whole and sharded docs.

---

## The Meta-Pattern: BMad as "Cognitive Hygiene"

BMad isn't about documentation. It's about **forcing functions** that compensate for AI failure modes:

| My Failure | BMad Fix | Mechanism |
|------------|----------|-----------|
| Suggest already-built solutions | Project context file | Loaded every session, lists active systems |
| Contact lookup failures | Lookup rules in context | Specifies order: GHL → SQLite → Email → Kanban |
| Not checking where told | Critical rules | "When Xavier tells you where to look, look THERE first" |
| Accepting "no results" as truth | Evidence grading | "Accept 'no results' as suspicious" |
| Narrative lock-in | Stronghold first | Start from confirmed evidence, not theory |
| Evidence amnesia | Case file pattern | Document findings, don't delete hypotheses |
| Confirmation bias | Adversarial review | Must find issues, zero findings = halt |
| Context collapse | Checkpoint preview | Orientation → Walkthrough → Detail Pass |

---

## Recommended Implementation Priority

### Week 1: Stop the Bleeding
1. **Create `memory/project-context.md`** with active systems, lookup rules, critical rules
2. **Update AGENTS.md** to load it every session
3. **Add "Check First" rule:** Before suggesting, search memory/index.md

### Week 2: Build the Habit
4. **Shard MEMORY.md** into systems/, decisions/, patterns/, index.md
5. **Create lookup-rules.md** with specific contact search order
6. **Add adversarial review** to task completion checklist

### Week 3: Add Structure
7. **Implement checkpoint preview** before declaring "done"
8. **Create decision-log.md** for key architectural choices
9. **Test the system:** Do I stop suggesting already-built solutions?

### Month 2: Advanced
10. **Named agent modes:** Mary for research, John for planning, Amelia for building
11. **Party mode** for complex decisions (present multiple perspectives)
12. **Forensic investigation** pattern for debugging

---

## The Real Test

The next time you ask me to do something, I should:

1. **Load project-context.md** (automatic via AGENTS.md)
2. **Check active systems** before suggesting
3. **If lookup task:** Try all sources in specified order
4. **If building:** Checkpoint preview before "done"
5. **If debugging:** Evidence grading, stronghold first

If I don't, call me out. The system only works if enforced.

---

## One-Line Summary

**BMad is a systematic way to make AI less wrong by forcing it to check what it would otherwise forget.**

---

*Report generated: May 21, 2026*
