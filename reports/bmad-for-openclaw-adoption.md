# BMad Method for OpenClaw: Memory & Workflow Adoption Report
## For Xavier Finch — May 21, 2026

---

## The Core Problem: My Memory Failures

You've documented my failure patterns in MEMORY.md:

1. **Suggesting already-built solutions** (Plaud webhook, Comcast CRM)
2. **Contact lookup failures** (not finding people who exist in GHL/SQLite)
3. **Not checking the right data source** when you tell me exactly where to look
4. **Accepting "no results" as truth** instead of questioning it

BMad has specific features designed to solve exactly these types of context/continuity failures.

---

## BMad Features That Directly Address My Failures

### 1. Project Context File (`project-context.md`)
**The Problem It Solves:** I don't know your conventions, patterns, or what's already built.

**How It Works:**
- A "constitution" file that lives at `_bmad-output/project-context.md`
- Loaded automatically by every workflow
- Contains: tech stack, critical rules, patterns, "don't do this" constraints

**What You'd Put In It For OpenClaw:**
```yaml
---
project_name: 'Daequan OpenClaw Workspace'
user_name: 'Xavier'
critical_rules:
  - 'Before suggesting ANY solution, search MEMORY.md for existing systems'
  - 'Active systems inventory: Plaud webhook, Comcast CRM, WhatsApp primary, Email monitor'
  - 'Contact lookup: Try GHL → SQLite → Email → Kanban files (not just one)'
  - 'When Xavier says "check again" or "it exists" — re-query with different parameters'
  - 'If Xavier tells you exactly where to look, look THERE first'
  - 'Accept "no results" as suspicious, especially when Xavier asks for a specific contact'
```

**Why This Helps:** Instead of me "remembering" (which I don't), the context file forces me to check before suggesting.

---

### 2. The `bmad-help` Skill
**The Problem It Solves:** I don't know what to do next or what's already been done.

**How It Works:**
- Inspects the project to see what's already been done
- Shows options based on installed modules
- Understands natural language: "bmad-help I just finished architecture, what next?"

**OpenClaw Equivalent:** We could create a `daequan-help` skill that:
- Reads MEMORY.md and recent memory files
- Lists active systems
- Suggests next steps based on current state
- Answers "what's already built?" before I suggest building it

---

### 3. Checkpoint Preview (`bmad-checkpoint-preview`)
**The Problem It Solves:** I make changes, then you discover I missed something or did it wrong.

**How It Works:**
- After implementation, the LLM walks YOU through the change
- Organized by concern (not file order)
- 5-step review: Orientation → Walkthrough → Detail Pass → Testing → Wrap-up
- You decide: ship, rework, or dig deeper

**OpenClaw Equivalent:** Before I say "done," I could:
- Summarize what I changed
- List files touched
- Highlight potential issues
- Ask for your review

---

### 4. Document Sharding
**The Problem It Solves:** MEMORY.md gets too big, I miss things.

**How It Works:**
- Splits large docs by level-2 headings
- Creates `index.md` with table of contents
- Workflows auto-discover both whole and sharded docs

**OpenClaw Application:**
- Split MEMORY.md into:
  - `memory/active-systems.md`
  - `memory/failure-patterns.md`
  - `memory/credentials.md`
  - `memory/preferences.md`
- Index file lists what's where
- I check the index first, then relevant shard

---

### 5. Quick Dev (`bmad-quick-dev`)
**The Problem It Solves:** Too many back-and-forth turns for simple tasks.

**How It Works:**
- Intent clarification first (compress to coherent goal)
- Route to smallest safe path
- Run longer unsupervised
- Bring human back only at checkpoints

**Your Use Case:**
You often want quick fixes without hand-holding. Quick Dev would:
- Clarify intent in 1 turn
- Build mini-spec
- Implement
- Present for review

---

### 6. Decision Log (`decision-log.md`)
**The Problem It Solves:** I forget WHY we made decisions.

**How It Works:**
- Every PRD produces a `decision-log.md`
- Documents: decision, alternatives considered, why this choice
- Referenced during updates

**OpenClaw Application:**
- `memory/decisions.md` — why we chose Railway over Vercel, why SQLite + MongoDB, etc.
- When I suggest changing something, check the decision log first

---

## Recommended Adoption for OpenClaw

### Immediate (This Week)

1. **Create `project-context.md`**
   - Path: `memory/project-context.md`
   - Include: active systems, lookup rules, failure pattern reminders
   - Reference it in AGENTS.md so I load it every session

2. **Shard MEMORY.md**
   - `memory/systems/` — Plaud, Comcast CRM, WhatsApp, Email
   - `memory/decisions/` — Key architectural choices
   - `memory/patterns/` — How we do things
   - `memory/index.md` — Table of contents

3. **Add "Check First" Rule to AGENTS.md**
   ```
   Before ANY suggestion:
   1. Search memory/index.md for relevant system
   2. If found, reference it: "We have X at Y, so..."
   3. If not found, check multiple sources before claiming "doesn't exist"
   ```

### Short Term (Next 2 Weeks)

4. **Create `daequan-help` Skill**
   - Natural language queries about what's built
   - "What's the Plaud webhook URL?"
   - "How do I look up a contact?"
   - "What systems are active?"

5. **Implement Checkpoint Preview Pattern**
   - Before declaring "done," summarize:
     - What I did
     - Files changed
     - Potential issues
     - Questions

### Medium Term (Next Month)

6. **Adopt PRD Workflow for Complex Features**
   - Use `bmad-prd` for major new systems
   - Creates: `prd.md`, `addendum.md`, `decision-log.md`
   - Validation gate before implementation

7. **Use Quick Dev for Small Changes**
   - Intent → Spec → Implement → Review
   - Fewer back-and-forth turns

---

## Specific Fixes for My Documented Failures

### Failure: "Suggests already-built solutions"
**BMad Fix:** Project context file lists active systems. I must check it before suggesting.

### Failure: "Contact lookup failures"
**BMad Fix:** Project context specifies lookup order: GHL → SQLite → Email → Kanban. Try all before claiming "not found."

### Failure: "Not checking where you told me to look"
**BMad Fix:** Critical rule: "When Xavier tells you exactly where to look, look THERE first."

### Failure: "Accepting 'no results' as truth"
**BMad Fix:** Rule: "Accept 'no results' as suspicious, especially when Xavier asks for a specific contact he knows exists."

---

## The Meta-Point

BMad treats AI memory as a **system design problem**, not a "try harder" problem. Instead of expecting me to remember, it:

1. **Documents** (project-context.md)
2. **Structures** (sharded docs, decision logs)
3. **Enforces** (workflows that check before acting)
4. **Reviews** (checkpoint preview before declaring done)

This is exactly what we need for OpenClaw.

---

## Next Steps

1. **Review this report** — Does this match your experience?
2. **Prioritize** — Which fix would have the most impact?
3. **Implement** — Start with project-context.md (30 minutes)
4. **Test** — See if I stop suggesting already-built solutions

Want me to create the `project-context.md` file now based on what's in MEMORY.md?

---

*Report generated: May 21, 2026*
