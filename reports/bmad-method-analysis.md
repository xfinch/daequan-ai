# BMad Method Analysis Report
## For Xavier Finch — May 21, 2026

---

## Executive Summary

**BMad Method** (Build More Architect Dreams) is an open-source, AI-driven agile development framework. It provides structured workflows, specialized agents, and intelligent planning that adapts to project complexity—from bug fixes to enterprise systems.

**Key Differentiator:** Unlike traditional AI tools that do the thinking for you, BMad acts as an "expert collaborator" that guides you through structured processes to bring out your best thinking in partnership with AI.

---

## Core Philosophy

### The Problem BMad Solves
Traditional AI coding produces average results because the AI does all the thinking. BMad inverts this: **you do the thinking, AI facilitates the process**.

The framework is built on a critical insight: **garbage in, garbage out compounds**. A weak PRD produces weak architecture, which produces weak stories, which produces weak code. BMad breaks this chain by enforcing structured thinking at each phase.

### Scale-Adaptive Intelligence
BMad automatically adjusts planning depth based on project complexity:
- Small bug fix → Lightweight process
- Enterprise platform → Full rigor with all gates

---

## The 4-Phase Workflow

### Phase 1: Analysis (Optional)
**Purpose:** Explore the problem space before committing to planning

| Workflow | Purpose | Output |
|----------|---------|--------|
| `bmad-brainstorming` | Facilitated creative ideation | `brainstorming-report.md` |
| `bmad-market-research` | Validate market assumptions | Research findings |
| `bmad-domain-research` | Build subject-matter expertise | Research findings |
| `bmad-technical-research` | Validate technical feasibility | Research findings |
| `bmad-product-brief` | 1-2 page executive summary | `product-brief.md` |
| `bmad-prfaq` | Amazon-style "Working Backwards" | `prfaq-{project}.md` |

**Key Insight:** Analysis outputs feed directly into PRD creation. The PRD workflow can source-extract from product briefs, PRFAQs, and research findings.

### Phase 2: Planning (Required)
**Purpose:** Define WHAT to build and for whom

| Workflow | Purpose | Output |
|----------|---------|--------|
| `bmad-prd` | Create/update/validate PRD | `prd.md`, `addendum.md`, `decision-log.md` |
| `bmad-create-ux-design` | Design user experience | `ux-spec.md` |

**The PRD Skill Has Three Intents:**
1. **Create** — New PRD from scratch via coached discovery
2. **Update** — Reconcile existing PRD with change signals
3. **Validate** — Critique PRD against configurable checklist → HTML report

### Phase 3: Solutioning
**Purpose:** Decide HOW to build it

| Workflow | Purpose | Output |
|----------|---------|--------|
| `bmad-create-architecture` | Make technical decisions explicit | `architecture.md` with ADRs |
| `bmad-create-epics-and-stories` | Break requirements into work | Epic files with stories |
| `bmad-check-implementation-readiness` | Gate check before coding | PASS/CONCERNS/FAIL decision |

### Phase 4: Implementation
**Purpose:** Build it, one story at a time

| Workflow | Purpose |
|----------|---------|
| `bmad-sprint-planning` | Initialize sprint |
| `bmad-dev-story` | Implement individual stories |

---

## The PRD Approach (Phase 2 Deep Dive)

### What Makes BMad's PRD Different

1. **Facilitated Discovery:** The AI acts as a Product Manager, not a scribe. It asks questions, challenges assumptions, and guides you to clarity.

2. **Three-Intent Unified Skill:** One skill handles create, update, and validate—reducing context switching.

3. **Structured Outputs:**
   - `prd.md` — Core requirements (FRs and NFRs)
   - `addendum.md` — Supporting context
   - `decision-log.md` — Why decisions were made

4. **Validation Gate:** Before implementation, the PRD can be validated against a checklist, producing a structured HTML report.

### PRD Inputs (Can Source-Extract From)
- `product-brief.md` (from Phase 1)
- `prfaq-{project}.md` (Amazon Working Backwards)
- Research findings
- Brainstorming reports

### When to Use Each Analysis Tool Before PRD

| Situation | Recommended Tool |
|-----------|------------------|
| Vague idea, no clear solution | `bmad-brainstorming` |
| Entering unfamiliar domain | `bmad-domain-research` |
| Competitors exist, unmapped | `bmad-market-research` |
| Technical feasibility uncertain | `bmad-technical-research` |
| Concept clear, need to document | `bmad-product-brief` |
| Need to stress-test concept | `bmad-prfaq` |

---

## Specialized Agents (12+ Domain Experts)

BMad provides named agents for specific domains:
- Product Manager (PM)
- Architect
- Developer
- UX Designer
- And more...

**"Party Mode":** Bring multiple agent personas into one session to collaborate and discuss.

---

## Key Features

| Feature | Description |
|---------|-------------|
| `bmad-help` | Interactive help skill—asks what's next, answers questions |
| Scale-Domain-Adaptive | Adjusts depth based on project size |
| Structured Workflows | Grounded in agile best practices |
| Complete Lifecycle | Brainstorming → Deployment |
| Skills Architecture | Extensible with custom modules |
| Cross-Platform | Works with Claude, Cursor, GitHub Copilot |

---

## Installation

```bash
npx bmad-method install
```

**Prerequisites:**
- Node.js v20.12+
- Python 3.10+
- uv package manager

**Non-Interactive (CI/CD):**
```bash
npx bmad-method install --directory /path/to/project --modules bmm --tools claude-code --yes
```

---

## Ecosystem Modules

| Module | Purpose |
|--------|---------|
| **BMM** (Core) | 34+ workflows for general development |
| **BMB** (Builder) | Create custom BMad agents and workflows |
| **TEA** (Test Architect) | Risk-based test strategy |
| **BMGD** (Game Dev Studio) | Unity, Unreal, Godot workflows |
| **CIS** (Creative Intelligence) | Innovation, brainstorming, design thinking |

---

## Assessment: Should We Adopt BMad?

### Strengths
1. **Structured without being rigid** — Optional Phase 1, required Phase 2+
2. **AI-native** — Built for Claude/Cursor, not retrofitted
3. **Open source** — No paywalls, fully extensible
4. **Battle-tested** — Based on industry agile practices
5. **Active community** — Discord, GitHub, YouTube

### Potential Friction Points
1. **Learning curve** — New vocabulary, new workflows
2. **Document overhead** — More artifacts than "just code"
3. **Tooling dependency** — Requires Node.js, Python, uv setup

### Best Fit For
- Projects where requirements are complex or shifting
- Teams doing AI-driven development
- When you need traceability (decision logs, ADRs)
- Multi-stakeholder projects (PM, Architect, UX alignment)

### Less Fit For
- One-off scripts
- Tight deadline "just ship it" moments
- Solo devs who already have a system that works

---

## Recommendation

**Adopt the PRD approach selectively.**

You don't need the full BMad ecosystem. The PRD workflow (`bmad-prd`) is the highest-value component:

1. **For complex features:** Use full BMad workflow (Analysis → PRD → Architecture → Stories)
2. **For medium features:** Skip Phase 1, go straight to PRD
3. **For quick fixes:** Skip entirely, just code

The PRD's three-intent design (Create/Update/Validate) is particularly valuable for ongoing projects where requirements evolve.

**Next Step:** Try `bmad-prd` on one upcoming complex feature. Evaluate if the structured discovery produces better outcomes than ad-hoc planning.

---

## Resources

- **Docs:** https://docs.bmad-method.org
- **GitHub:** https://github.com/bmad-code-org/BMAD-METHOD
- **Discord:** https://discord.gg/gk8jAdXWmj
- **LLM-Optimized Docs:** https://docs.bmad-method.org/llms-full.txt

---

*Report generated: May 21, 2026*
