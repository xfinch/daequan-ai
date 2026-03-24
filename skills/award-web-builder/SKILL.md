---
name: award-web-builder
description: Create award-winning landing pages and websites that meet Awwwards, CSS Design Awards, and Webby Awards standards. Use when building high-end marketing sites, portfolio sites, product launches, or any web project where exceptional design, UX, animation, and conversion optimization are critical. Triggers on phrases like "award-winning website", "premium landing page", "Awwwards quality", "high-end site", or when visual excellence and cutting-edge design are required.
---

# Award-Winning Web Builder

Build websites that win awards. This skill provides the frameworks, patterns, and assets to create exceptional digital experiences that stand up to the scrutiny of top design awards.

## Quick Start

When asked to build an award-winning site:

1. **Determine the archetype** (see references/archetypes.md)
2. **Apply the design principles** (see references/design-principles.md)
3. **Use the boilerplate** from assets/boilerplate/
4. **Follow the animation guidelines** (see references/animation-patterns.md)
5. **Validate against the award criteria** (see references/award-criteria.md)

## Award Categories & Standards

### Awwwards Judging Criteria
- **Design**: Visual aesthetics, typography, color, composition
- **Usability**: Navigation, clarity, user flow
- **Creativity**: Innovation, originality, concept
- **Content**: Quality, relevance, storytelling
- **Mobile**: Responsive design, touch optimization
- **Developer**: Code quality, performance, accessibility

### CSS Design Awards Criteria
- **UI Design**: Interface excellence
- **UX Design**: User experience quality
- **Innovation**: Technical/creative breakthroughs

### Webby Awards Focus
- **Content**: Editorial excellence
- **Structure**: Information architecture
- **Visual Design**: Aesthetic execution
- **Functionality**: Feature completeness
- **Interactivity**: Engagement mechanics

## Website Archetypes

See [references/archetypes.md](references/archetypes.md) for detailed patterns:

| Archetype | Best For | Key Features |
|-----------|----------|--------------|
| **Immersive Experience** | Brands, portfolios | Full-screen, WebGL, storytelling |
| **Editorial Elegance** | Magazines, blogs | Typography-focused, clean grids |
| **Product Showcase** | SaaS, physical products | 3D visualization, feature tours |
| **Conversion Machine** | Landing pages, campaigns | CTA optimization, social proof |
| **Agency Portfolio** | Creative agencies | Case studies, team, process |

## Design Principles (Non-Negotiable)

See [references/design-principles.md](references/design-principles.md):

1. **Typography as Hero** - Type is the primary design element
2. **Whitespace is Sacred** - Generous breathing room
3. **Micro-interactions Matter** - Every hover, click, scroll has feedback
4. **Performance is Design** - <3s load, 60fps animations
5. **Mobile-First Excellence** - Thumb zones, touch targets, gestures

## Animation Patterns

See [references/animation-patterns.md](references/animation-patterns.md):

- **Page Load Sequence**: Staggered reveals, 0.6-1.2s total
- **Scroll Triggers**: Parallax, fade-ups, pin sections
- **Hover States**: Transform, opacity, scale (0.3s ease)
- **Page Transitions**: Exit animations before route change
- **Micro-interactions**: Buttons, toggles, inputs

## Technical Stack Recommendations

### Modern Award-Winning Stack (2025)
```
Framework: Next.js 14+ (App Router)
Styling: Tailwind CSS + CSS Variables
Animation: GSAP + ScrollTrigger + Framer Motion
3D: Three.js / React Three Fiber
CMS: Sanity / Contentful (optional)
Hosting: Vercel / Netlify
```

### Essential Libraries
- **GSAP** - Professional-grade animations
- **Lenis** - Smooth scrolling
- **Three.js** - 3D experiences
- **SplitType** - Text animations
- **Lenis** - Smooth scroll

## Workflow

### Phase 1: Discovery
1. Define archetype (see archetypes.md)
2. Research 3-5 reference sites
3. Create moodboard
4. Define success metrics

### Phase 2: Design
1. Wireframe key pages
2. Typography system (see references/typography-systems.md)
3. Color palette (see references/color-palettes.md)
4. Animation storyboard

### Phase 3: Build
1. Use boilerplate from assets/boilerplate/
2. Implement base layout
3. Add animations incrementally
4. Performance optimization
5. Accessibility audit

### Phase 4: Polish
1. Cross-browser testing
2. Mobile responsiveness
3. Performance audit (Lighthouse 90+)
4. Award criteria validation

## Common Patterns

### The "Site of the Year" Header
- Full viewport height (100vh)
- Large typography (8vw+)
- Subtle parallax background
- Scroll indicator animation
- Staggered text reveal on load

### Award-Winning Navigation
- Hidden by default, revealed on scroll
- Large touch targets (44px+)
- Smooth transitions
- Active state indicators
- Mobile: Full-screen overlay

### Conversion-Focused CTAs
- High contrast color
- Clear action verb
- Hover micro-interaction
- Above the fold placement
- Sticky on mobile

## Resources

- [references/archetypes.md](references/archetypes.md) - Site type patterns
- [references/design-principles.md](references/design-principles.md) - Core design rules
- [references/animation-patterns.md](references/animation-patterns.md) - Motion guidelines
- [references/award-criteria.md](references/award-criteria.md) - Judging rubrics
- [references/typography-systems.md](references/typography-systems.md) - Type scales
- [references/color-palettes.md](references/color-palettes.md) - Award-winning palettes
- assets/boilerplate/ - Starting templates

## Validation Checklist

Before shipping, verify:

- [ ] Lighthouse score 90+ (Performance, Accessibility, SEO)
- [ ] All animations 60fps
- [ ] Mobile experience is exceptional
- [ ] Typography scales beautifully
- [ ] Whitespace feels intentional
- [ ] Micro-interactions on all interactive elements
- [ ] Loading states handled gracefully
- [ ] Error states designed
- [ ] Cross-browser tested
- [ ] Meets WCAG 2.1 AA standards
