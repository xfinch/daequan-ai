# REAL ESTATE LEAD FILTERING SYSTEM
## Kristy Tivnan - HomeGroup.com

---

## HOW IT WORKS (My Guess)

### Step 1: Lead Captured
```
HomeGroup.com Form Submit
    ↓
GHL Contact Created
    ↓
TAG: "New Lead - Unqualified"
    ↓
TRIGGER: Qualification Sequence Starts
```

### Step 2: Automated Qualification (SMS + Email)

**Hour 0 (Immediate):**
- SMS: "Hi [Name]! Thanks for your interest in [property/area]. Quick question: When are you looking to buy? Reply: ASAP, Soon, or Planning"

**Hour 2 (If no response):**
- Email: "We want to help you find the perfect home. Can you tell us your timeline?"

**Hour 24 (If responded):**
- SMS: "Great! Are you pre-approved for a mortgage? This helps us show you homes in your budget."

### Step 3: Scoring System

| Question | Hot Answer (25 pts) | Warm (15) | Cold (5) |
|----------|-------------------|-----------|----------|
| Timeline | ASAP (0-30 days) | 1-3 months | 3+ months |
| Pre-approved | Yes, fully approved | Pre-qualified | Not yet |
| Price clarity | Specific range | Ballpark | No idea |
| Motivation | Relocation/job change | Downsizing | "Just looking" |

### Step 4: Lead Routing

**Score 75-100 (HOT):**
```
TAG: "HOT LEAD - CALL NOW"
TASK: Create for agent (Due: 15 minutes)
SMS Alert: "🔥 Hot lead: [Name] is pre-approved and ready to buy ASAP. Call: [phone]"
```

**Score 50-74 (WARM):**
```
TAG: "WARM - Nurture"
WORKFLOW: 7-day nurture sequence
TASK: Follow up in 3 days
```

**Score 0-49 (COLD):**
```
TAG: "COLD - Long Term"
WORKFLOW: Monthly market updates only
NO agent task created
```

---

## GHL WORKFLOW AUTOMATION

### Workflow 1: Qualification Trigger
```
TRIGGER: Contact Created (Tag: "HomeGroup Lead")
ACTION 1: Wait 5 minutes
ACTION 2: Send SMS (Qualification Q1)
ACTION 3: Wait 2 hours
ACTION 4: If no reply → Send Email Q1
```

### Workflow 2: Response Handler
```
TRIGGER: Contact replies to SMS
ACTION 1: Update custom field "Q1_Timeline"
ACTION 2: Calculate score
ACTION 3: Send next question (if needed)
ACTION 4: If score >= 75 → Trigger "Hot Lead Alert"
```

### Workflow 3: Hot Lead Alert
```
TRIGGER: Score >= 75
ACTION 1: Tag "HOT LEAD"
ACTION 2: Create task (Assign to agent, Due: 15 min)
ACTION 3: Send SMS alert to agent
ACTION 4: Move to pipeline stage "Hot Lead"
```

---

## AM I CLOSE?

This is what I'm picturing Kristy needs:

1. **Capture leads** from HomeGroup.com → GHL
2. **Auto-qualify** via SMS/email conversation
3. **Score leads** based on responses
4. **Route hot leads** immediately to agents
5. **Nurture warm leads** automatically
6. **Filter out tire-kickers** (cold leads go to drip only)

**Tell me:**
- Did I nail it?
- What am I missing?
- What's Kristy's biggest pain point I'm not addressing?
- Is the scoring logic right for real estate?

---

## QUESTIONS FOR KRISTY

1. How many leads does HomeGroup.com generate per week?
2. What % are currently "junk" vs qualified?
3. How fast do agents currently respond to new leads?
4. Does HomeGroup.com use a specific form builder? (WordPress, custom, etc.)
5. What CRM fields matter most for her agents?
6. Does she want the qualification to be SMS, email, or both?
7. What's the biggest time-waster for her agents right now?

---

**Ready for your corrections!** Tell me where I'm off.
