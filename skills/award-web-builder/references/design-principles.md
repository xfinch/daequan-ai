# Design Principles

The non-negotiable rules that separate award-winning sites from average ones.

---

## 1. Typography as Hero

**Principle:** Typography is the primary design element, not an afterthought.

### Rules:
- **Scale dramatically**: Hero text at 4-12vw
- **Contrast weights**: Bold headlines + light body
- **Limit families**: Max 2 typefaces per site
- **Respect hierarchy**: Clear H1-H6 distinction
- **Optimize reading**: 16-20px body, 1.5-1.7 line height

### Award-Winning Pairings:
```
Headlines: Inter, Sora, Space Grotesk, Clash Display
Body: Inter, Satoshi, General Sans, System UI
Accent: Playfair Display, Editorial New (serif contrast)
```

### Patterns:
- **Outlines**: Stroke text for depth
- **Mixed weights**: Bold + light in same line
- **Vertical text**: For edgy layouts
- **Kinetic type**: Animation as design element

---

## 2. Whitespace is Sacred

**Principle:** Generous breathing room creates luxury and focus.

### Rules:
- **Section padding**: 80-120px vertical minimum
- **Container max-width**: 1280-1440px
- **Text containers**: Max 65ch for readability
- **Element spacing**: 2x the element size as minimum gap
- **Mobile**: Maintain ratios, don't over-compact

### Patterns:
- **Asymmetric balance**: Weight on one side, space on other
- **Floating elements**: Isolate key content in void
- **Full-bleed breaks**: Occasional edge-to-edge moments
- **Breathing room**: Never crowd the viewport

---

## 3. Micro-interactions Matter

**Principle:** Every interactive element responds to user action.

### Rules:
- **Hover states**: All links, buttons, cards
- **Focus states**: Visible, on-brand
- **Loading states**: Never leave user guessing
- **Transitions**: 0.2-0.4s, ease-out preferred
- **Feedback**: Confirm actions visually

### Patterns:
```css
/* Button hover */
.button {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.3s ease;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

/* Link hover */
.link {
  position: relative;
}
.link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.3s ease;
}
.link:hover::after {
  width: 100%;
}
```

---

## 4. Performance is Design

**Principle:** Slow sites can't win awards, regardless of aesthetics.

### Rules:
- **Load time**: <3s on 4G
- **Lighthouse**: 90+ on all metrics
- **Animation**: 60fps minimum
- **Images**: WebP, lazy loaded, properly sized
- **Fonts**: Subset, preload critical, swap for rest

### Checklist:
- [ ] Compress all images (TinyPNG, Squoosh)
- [ ] Use next-gen formats (WebP, AVIF)
- [ ] Lazy load below-fold images
- [ ] Preload critical fonts
- [ ] Code split routes
- [ ] Optimize Core Web Vitals

---

## 5. Mobile-First Excellence

**Principle:** The mobile experience should feel native, not compromised.

### Rules:
- **Touch targets**: 44px minimum
- **Thumb zones**: Primary actions in bottom 1/3
- **Gestures**: Swipe, pinch where appropriate
- **Viewport**: Respect safe areas, notches
- **Performance**: Lighter than desktop

### Patterns:
- **Sticky CTAs**: Bottom bar on mobile
- **Simplified nav**: Hamburger or tab bar
- **Stacked layouts**: Single column priority
- **Reduced motion**: Respect prefers-reduced-motion
- **Optimized images**: Smaller assets for mobile

---

## 6. Visual Hierarchy

**Principle:** Guide the eye intentionally through the page.

### Techniques:
- **Size**: Larger = more important
- **Color**: Contrast draws attention
- **Position**: Top-left gets attention first (Western)
- **Whitespace**: Isolation creates focus
- **Motion**: Movement catches the eye

### Z-Pattern (Western reading):
```
1. Top-left (logo)
2. Top-right (nav/CTA)
3. Diagonal to bottom-left
4. Bottom-right (CTA)
```

### F-Pattern (Content heavy):
- Scan across top
- Scan down left side
- Read interesting sections

---

## 7. Color Mastery

**Principle:** Color conveys emotion and brand identity.

### Rules:
- **Primary**: 1 dominant brand color
- **Secondary**: 1-2 supporting colors
- **Neutrals**: Black, white, grays
- **Accents**: Use sparingly for CTAs/highlights
- **Contrast**: 4.5:1 minimum for text

### Award-Winning Palettes:
```
Monochrome: Black + white + one accent
Duotone: Two bold colors, high contrast
Earthy: Browns, creams, sage greens
Neon: Dark bg + electric accents
Minimal: Grayscale + single pop color
```

---

## 8. Consistency

**Principle:** Every page should feel like the same brand.

### Rules:
- **Spacing scale**: Use consistent increments (4px, 8px, 16px...)
- **Border radius**: Pick 2-3 values, stick to them
- **Shadows**: One elevation system
- **Transitions**: Same timing functions throughout
- **Voice**: Consistent copy tone

---

## Common Mistakes to Avoid

1. **Too many fonts** - Stick to 1-2 families
2. **Ignored mobile** - Design mobile simultaneously
3. **Missing hover states** - Every button needs feedback
4. **Wall of text** - Break up with visuals, whitespace
5. **Slow load** - Optimize images, lazy load
6. **Cluttered hero** - One message, one CTA
7. **Poor contrast** - Test with contrast checker
8. **Inconsistent spacing** - Use a scale
9. **No loading states** - Show progress
10. **Generic stock photos** - Use authentic imagery
