# GAMIFIED LEAD QUALIFICATION
## Kristy Tivnan - "Let's Build Your Dream Home"

---

## THE CONCEPT

Instead of a boring survey, the lead **builds a house** through answering questions. Each answer adds a piece to their house. At the end, they have a completed house... and we've secretly qualified them.

**They think:** "Fun interactive experience"  
**We know:** Sophisticated qualification algorithm

---

## THE VISUAL EXPERIENCE

### Screen Layout
```
┌─────────────────────────────────────────┐
│                                         │
│     🏠  [HOUSE BUILDS HERE]            │
│        (Top left quadrant)              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│     Question:                           │
│     "When do you want to move?"         │
│                                         │
│     [ASAP]  [Soon]  [Later]            │
│                                         │
│     ← Previous    Next →               │
│                                         │
└─────────────────────────────────────────┘
```

---

## THE HOUSE PARTS (Qualification Questions)

### Question 1: Foundation = Timeline
**"Let's start with your foundation. When do you want to move?"**

| Answer | House Piece | Points |
|--------|-------------|--------|
| ASAP (0-30 days) | 🧱 Solid concrete foundation | +25 |
| Soon (1-3 months) | 🧱 Wood frame foundation | +15 |
| Later (3+ months) | 🧱 Pier foundation | +5 |
| Just browsing | 🧱 No foundation yet | 0 |

**Visual:** Foundation appears under house

---

### Question 2: Frame = Financial Readiness  
**"Now let's frame your house. Are you pre-approved for a mortgage?"**

| Answer | House Piece | Points |
|--------|-------------|--------|
| Yes, fully approved | 🏗️ Steel frame (strong) | +25 |
| Pre-qualified | 🏗️ Wood frame (standard) | +15 |
| Working on it | 🏗️ Partial frame | +5 |
| Not yet | 🏗️ No frame | 0 |

**Visual:** Frame rises from foundation

---

### Question 3: Roof = Budget Clarity
**"Let's put a roof on it. What's your price range?"**

| Answer | House Piece | Points |
|--------|-------------|--------|
| Specific range ($400k-$500k) | 🏠 Complete roof | +20 |
| Ballpark (around $400k) | 🏠 Partial roof | +10 |
| No idea | 🏠 No roof | 0 |

**Visual:** Roof appears (left side, then right side)

---

### Question 4: Windows = Motivation
**"Let's add some windows. Why are you moving?"**

| Answer | House Piece | Points |
|--------|-------------|--------|
| Relocation/job change | 🪟 Many windows (bright) | +20 |
| Downsizing/upsizing | 🪟 Some windows | +10 |
| Just looking | 🪟 Few windows | +5 |

**Visual:** Windows pop into frame

---

### Question 5: Door = Urgency
**"Finally, let's add your front door. How many homes have you seen?"**

| Answer | House Piece | Points |
|--------|-------------|--------|
| Several, ready to buy | 🚪 Large front door | +15 |
| A few, still looking | 🚪 Regular door | +10 |
| None yet | 🚪 Small door | +5 |

**Visual:** Door appears, house is complete!

---

## THE REVEAL

### Completion Screen
```
┌─────────────────────────────────────────┐
│                                         │
│     🏠  YOUR DREAM HOME IS READY!      │
│                                         │
│     [Beautiful completed house]        │
│                                         │
│     "Based on your home, we think      │
│      you'd love these properties..."   │
│                                         │
│     [See Your Matches]                 │
│                                         │
└─────────────────────────────────────────┘
```

**Behind the scenes:** Score calculated, bucket assigned

---

## SCORING = HOUSE TYPE

| Total Score | House Built | Bucket | What Happens |
|-------------|-------------|--------|--------------|
| 85-105 | 🏰 **Estate** (beautiful, move-in ready) | 🔥 **HOT** | Agent calls within 15 min |
| 60-84 | 🏠 **Family Home** (solid, comfortable) | 🟡 **WARM** | Sent to nurture, follow up in 3 days |
| 35-59 | 🏡 **Starter Home** (cozy, potential) | ⚪ **COLD** | Marketing drip only |
| 0-34 | 🏕️ **Cabin** (weekend getaway) | ❌ **REJECT** | No follow-up |

---

## THE SECRET SAUCE

**User Experience:**
- ✅ Fun and engaging
- ✅ Visual progress (building the house)
- ✅ Feels like a game, not a survey
- ✅ Completion satisfaction (house finished!)
- ✅ No idea they're being qualified

**Behind the Scenes:**
- ✅ Each answer = data point
- ✅ Running score calculation
- ✅ Automatic bucket assignment
- ✅ Brivity integration
- ✅ Agent alerts for hot leads

---

## TECHNICAL IMPLEMENTATION

### Frontend (What User Sees)
- Interactive house builder
- SVG/CSS animations for house parts appearing
- Progress indicator (5 questions)
- Mobile-responsive

### Backend (What We Track)
```javascript
const calculateScore = (answers) => {
  let score = 0;
  score += answers.timeline.score;      // Foundation
  score += answers.preapproved.score;   // Frame
  score += answers.budget.score;        // Roof
  score += answers.motivation.score;    // Windows
  score += answers.urgency.score;       // Door
  return score;
};

const assignBucket = (score) => {
  if (score >= 85) return 'HOT';
  if (score >= 60) return 'WARM';
  if (score >= 35) return 'COLD';
  return 'REJECT';
};
```

---

## EXAMPLE USER JOURNEYS

### Journey 1: Hot Lead (The Estate)
**User sees:** "Wow, I built a beautiful estate!"  
**We see:** Score 95, fully pre-approved, ASAP timeline, specific budget  
**Action:** 🔥 Agent gets SMS: "[Name] built an ESTATE - call NOW!"

### Journey 2: Cold Lead (The Starter Home)  
**User sees:** "Here's my cozy starter home!"  
**We see:** Score 45, no pre-approval, just browsing  
**Action:** ⚪ Marketing drip only, no agent time wasted

### Journey 3: Fake Email (No House)
**User tries:** "noneofyourbusiness@yahoo.com"  
**System says:** "Oops! We need a valid email to save your house."  
**Action:** ❌ Rejected before house even starts

---

## WHY THIS WORKS

**Traditional Survey:**
- ❌ Boring, feels like work
- ❌ High abandonment rate
- ❌ People rush through
- ❌ Bad data quality

**"Build Your House":**
- ✅ Fun, feels like a game
- ✅ High completion rate
- ✅ People think carefully (it's THEIR house)
- ✅ Rich, accurate data
- ✅ Memorable experience

---

**Kristy's agents only see the mansions and family homes.**
**The fixer-uppers and tents never waste their time.**

---

**Is this the gamification concept you were thinking?**
