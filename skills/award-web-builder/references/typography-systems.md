# Typography Systems

Award-winning sites use deliberate, scalable typography systems.

---

## System Structure

### Type Scale (Major Third - 1.25)
```
12px  - Caption, labels
14px  - Small text, metadata
16px  - Body text (base)
20px  - Lead paragraph
25px  - H4
31px  - H3  
39px  - H2
49px  - H1
61px  - Display
76px  - Hero
```

### Type Scale (Perfect Fourth - 1.333 - More Dramatic)
```
16px  - Body
21px  - Lead
28px  - H4
37px  - H3
50px  - H2
67px  - H1
89px  - Display
```

### Fluid Type (Clamp for Responsiveness)
```css
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.375rem);
  --text-xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
  --text-2xl: clamp(2rem, 1.5rem + 2.5vw, 3rem);
  --text-3xl: clamp(2.5rem, 1.75rem + 3.75vw, 4.5rem);
  --text-4xl: clamp(3rem, 2rem + 5vw, 6rem);
}
```

---

## Recommended Font Pairings

### Modern Sans (Clean, Contemporary)
```css
/* Headlines */
font-family: 'Space Grotesk', sans-serif;
font-weight: 500, 700;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 400, 500;
```

### Editorial (Sophisticated)
```css
/* Headlines */
font-family: 'Playfair Display', serif;
font-weight: 600, 700;

/* Body */
font-family: 'Source Sans 3', sans-serif;
font-weight: 400, 600;
```

### Technical (Developer/Tech)
```css
/* Headlines */
font-family: 'JetBrains Mono', monospace;
font-weight: 700;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 400;
```

### Geometric (Bold, Modern)
```css
/* Headlines */
font-family: 'Clash Display', sans-serif;
font-weight: 600, 700;

/* Body */
font-family: 'Satoshi', sans-serif;
font-weight: 400, 500;
```

### Minimal (Swiss Style)
```css
/* Everything */
font-family: 'Helvetica Neue', 'Arial', sans-serif;
/* or */
font-family: 'General Sans', sans-serif;
```

---

## Font Loading Strategy

### Critical Above-Fold:
```html
<link rel="preload" href="/fonts/headline.woff2" as="font" type="font/woff2" crossorigin>
```

### CSS Font-Face:
```css
@font-face {
  font-family: 'Custom Font';
  src: url('/fonts/custom.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Critical for performance */
}
```

### Google Fonts (Optimized):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
```

---

## Body Text Best Practices

### Optimal Reading:
```css
body {
  font-size: 16-20px;
  line-height: 1.6-1.7;
  color: #1a1a1a; /* Not pure black */
  max-width: 65ch; /* Characters per line */
}
```

### Paragraph Spacing:
```css
p {
  margin-bottom: 1.5em; /* Equal to line-height */
}
```

### Links in Text:
```css
a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  text-decoration-thickness: 1px;
}
```

---

## Headline Treatments

### Outlined Text:
```css
.headline-outline {
  -webkit-text-stroke: 2px currentColor;
  -webkit-text-fill-color: transparent;
}
```

### Gradient Text:
```css
.headline-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Mixed Weights:
```html
<h1>
  <span class="font-light">We build</span>
  <span class="font-bold">digital</span>
  <span class="font-light">experiences</span>
</h1>
```

### Vertical Text:
```css
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

---

## Responsive Typography

### Desktop-First Approach:
```css
h1 {
  font-size: 4rem; /* Desktop */
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem; /* Mobile */
  }
}
```

### Fluid Approach (Preferred):
```css
h1 {
  font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
}
```

### Mobile Adjustments:
```css
@media (max-width: 768px) {
  body {
    font-size: 16px; /* Don't go smaller */
  }
  
  h1 { font-size: clamp(2rem, 8vw, 3rem); }
  h2 { font-size: clamp(1.75rem, 6vw, 2.5rem); }
  
  /* Increase line-height slightly on mobile */
  p { line-height: 1.7; }
}
```

---

## Special Techniques

### Text Mask (Image in Text):
```css
.text-mask {
  background-image: url('image.jpg');
  background-size: cover;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Kinetic Typography Container:
```css
.kinetic-text {
  font-size: 15vw; /* Viewport-based */
  line-height: 0.85;
  letter-spacing: -0.04em;
}
```

### Caps with Spacing:
```css
.caps {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.875em;
}
```

---

## Accessibility

### Minimum Contrast:
- Normal text: 4.5:1
- Large text: 3:1

### Font Size Minimums:
- Body: 16px
- Small/Caption: 12px (not smaller)

### Line Height:
- Body: Minimum 1.5
- Headlines: 1.1-1.3

### Testing:
Use WebAIM Contrast Checker and browser dev tools.
