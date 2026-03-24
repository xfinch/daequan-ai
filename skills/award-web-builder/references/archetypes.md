# Website Archetypes

Award-winning sites follow distinct patterns. Choose the archetype that fits your project goals, then apply the specific patterns for that type.

---

## 1. Immersive Experience

**Best for:** Brand launches, portfolios, creative agencies, luxury products

**Hallmarks:**
- Full-screen sections (100vh)
- WebGL/3D elements
- Storytelling through scroll
- Cinematic photography/video
- Minimal UI chrome

**Key Patterns:**
- **Hero**: Full viewport, video background or 3D scene
- **Scroll Journey**: Each section reveals new story beat
- **Navigation**: Hidden initially, appears on scroll
- **Typography**: Large, bold, often outlined or mixed fill
- **CTAs**: Minimal, integrated into experience

**Award Examples:**
- Igloo Inc (Awwwards SOTY 2024)
- Lusion v3 (Awwwards SOTY 2023)
- Lando Norris (Awwwards SOTY 2025)

**Technical Notes:**
- Use Three.js for 3D
- Implement smooth scroll (Lenis)
- Lazy load heavy assets
- Fallback for mobile/low-power mode

---

## 2. Editorial Elegance

**Best for:** Publications, blogs, content-heavy sites, thought leadership

**Hallmarks:**
- Typography as primary design element
- Grid-based layouts
- Generous whitespace
- Photography-forward
- Reading-focused

**Key Patterns:**
- **Article Layout**: Max 75ch line length, 1.6 line height
- **Typography Hierarchy**: Clear H1-H6 distinction
- **Image Treatment**: Full-bleed hero, inline galleries
- **Navigation**: Persistent, minimal
- **Related Content**: Smart recommendations

**Award Examples:**
- Bloomberg (historical winner)
- The New Yorker (web presence)
- Medium (editorial features)

**Technical Notes:**
- Variable fonts for performance
- Progressive image loading
- Print-friendly CSS
- Dark mode support

---

## 3. Product Showcase

**Best for:** SaaS, physical products, apps, tools

**Hallmarks:**
- Product as hero
- Feature tours
- Social proof integration
- Clear value proposition
- Conversion-optimized

**Key Patterns:**
- **Hero**: Product screenshot/mockup + headline
- **Features Grid**: Icon + text, often 3-column
- **Social Proof**: Logos, testimonials, stats
- **Pricing**: Clear tiers, highlighted recommendation
- **FAQ**: Expandable accordion

**Award Examples:**
- Opal Tadpole (Awwwards SOTY 2024)
- Linear (SaaS design standard)
- Vercel (developer-focused)

**Technical Notes:**
- Interactive product demos
- Video backgrounds (compressed)
- Lazy load below-fold
- A/B test CTAs

---

## 4. Conversion Machine

**Best for:** Landing pages, campaigns, lead gen, sales pages

**Hallmarks:**
- Single goal focus
- Above-fold CTA
- Social proof prominence
- Scarcity/urgency tactics
- Minimal navigation

**Key Patterns:**
- **Hero**: Headline + subhead + CTA + visual
- **Benefits**: 3-4 key value props
- **Social Proof**: Testimonials, ratings, user counts
- **FAQ**: Objection handling
- **Final CTA**: Repeat at bottom

**Award Examples:**
- Don't Board Me (Awwwards SOTY 2024)
- Award-winning campaign landing pages
- Webby-winning marketing sites

**Technical Notes:**
- Fast load (<2s)
- Form validation UX
- Tracking pixels
- Mobile-optimized forms

---

## 5. Agency Portfolio

**Best for:** Creative agencies, studios, freelancers

**Hallmarks:**
- Work-first approach
- Case study depth
- Team/personality showing
- Process explanation
- Contact emphasis

**Key Patterns:**
- **Hero**: Bold statement or selected work
- **Work Grid**: Thumbnails, hover reveals
- **Case Studies**: Problem → Solution → Results
- **About**: Team photos, culture, values
- **Contact**: Form + social links

**Award Examples:**
- Noomo Agency (Awwwards SOTY 2023)
- KPR (Awwwards SOTY 2022)
- Most agency SOTD winners

**Technical Notes:**
- Image optimization critical
- Video case studies
- Smooth page transitions
- Contact form spam protection

---

## Archetype Selection Guide

| Goal | Primary Archetype | Secondary |
|------|------------------|-----------|
| Wow investors | Immersive | Product Showcase |
| Generate leads | Conversion Machine | Product Showcase |
| Build authority | Editorial Elegance | Agency Portfolio |
| Launch product | Product Showcase | Conversion Machine |
| Get hired | Agency Portfolio | Immersive |
| Tell brand story | Immersive | Editorial Elegance |

---

## Hybrid Approaches

Many award winners blend archetypes:

- **Immersive + Product**: 3D product experience
- **Editorial + Conversion**: Content marketing with CTAs
- **Agency + Immersive**: Portfolio as experience

Choose a primary archetype for the homepage, then adapt secondary pages as needed.
