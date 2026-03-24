# Color Palettes

Award-winning color palettes that work.

---

## Palette Types

### 1. Monochrome
Single color with variations.

```css
:root {
  --primary-900: #0c4a6e;
  --primary-800: #075985;
  --primary-700: #0369a1;
  --primary-600: #0284c7;
  --primary-500: #0ea5e9; /* Base */
  --primary-400: #38bdf8;
  --primary-300: #7dd3fc;
  --primary-200: #bae6fd;
  --primary-100: #e0f2fe;
  --primary-50: #f0f9ff;
  
  --neutral-900: #0f172a;
  --neutral-800: #1e293b;
  --neutral-700: #334155;
  --neutral-600: #475569;
  --neutral-500: #64748b;
  --neutral-400: #94a3b8;
  --neutral-300: #cbd5e1;
  --neutral-200: #e2e8f0;
  --neutral-100: #f1f5f9;
  --neutral-50: #f8fafc;
}
```

**Use when:** You want focus on content, not color.

---

### 2. Duotone
Two bold colors.

```css
:root {
  --color-dark: #0a0a0a;
  --color-light: #fafafa;
  --color-accent: #ff3d00;
  --color-secondary: #00c853;
}
```

**Award Example:** Many Awwwards SOTD winners use black + white + one electric accent.

---

### 3. Earthy/Organic
Natural, warm tones.

```css
:root {
  --earth-900: #292524;
  --earth-800: #44403c;
  --earth-700: #57534e;
  --earth-600: #78716c;
  --earth-500: #a8a29e;
  --earth-400: #d6d3d1;
  --earth-300: #e7e5e4;
  --earth-200: #f5f5f4;
  --earth-100: #fafaf9;
  
  --sage-500: #84a98c;
  --sage-400: #a3b899;
  --cream: #f5f1e8;
  --terracotta: #c67b5c;
}
```

**Use when:** Wellness, sustainability, lifestyle brands.

---

### 4. Neon/Dark Mode
Dark background + electric accents.

```css
:root {
  --bg-dark: #0a0a0f;
  --bg-elevated: #12121a;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  
  --neon-cyan: #00f5ff;
  --neon-pink: #ff00ff;
  --neon-purple: #8b5cf6;
  --neon-green: #39ff14;
}
```

**Use when:** Tech, gaming, crypto, futuristic brands.

---

### 5. Minimal/White Space
White + black + subtle accent.

```css
:root {
  --white: #ffffff;
  --off-white: #fafafa;
  --light-gray: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent: #0066ff; /* Single blue accent */
}
```

**Use when:** Agencies, portfolios, luxury brands.

---

## Award-Winning Palette Examples

### Lusion Style (Tech/3D)
```
Background: #000000
Surface: #111111
Primary: #ffffff
Accent: #00ff88 (electric green)
Secondary: #4444ff (electric blue)
```

### Editorial Magazine
```
Background: #faf9f7 (warm white)
Text: #1a1a1a
Accent: #cc0000 (classic red)
Secondary: #f5f5f5
```

### SaaS Modern
```
Background: #ffffff
Surface: #f8fafc
Text: #0f172a
Primary: #3b82f6 (blue)
Secondary: #8b5cf6 (purple)
Success: #10b981
```

### Luxury/Black
```
Background: #0a0a0a
Surface: #141414
Text: #ffffff
Accent: #c9a962 (gold)
Secondary: #333333
```

---

## Color Usage Rules

### 60-30-10 Rule:
- **60%** - Dominant (backgrounds, large areas)
- **30%** - Secondary (sections, cards)
- **10%** - Accent (CTAs, highlights)

### Contrast Requirements:
- Text on backgrounds: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 against adjacent colors

### Semantic Colors:
```css
:root {
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

---

## Dark Mode

### Toggle Strategy:
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
}

[data-theme="dark"] {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
}
```

### Dark Mode Adjustments:
- Don't use pure black (#000000), use dark gray
- Reduce saturation by 10-20%
- Lighten shadows (they appear harsher on dark)
- Use lighter borders

---

## Gradients

### Subtle Depth:
```css
background: linear-gradient(
  180deg,
  #ffffff 0%,
  #f8fafc 100%
);
```

### Brand Gradient:
```css
background: linear-gradient(
  135deg,
  #667eea 0%,
  #764ba2 100%
);
```

### Mesh Gradients (Modern):
```css
background: 
  radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%),
  radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
  radial-gradient(at 0% 50%, hsla(340,100%,76%,1) 0px, transparent 50%);
```

---

## Tools

- **Coolors.co** - Generate palettes
- **ColorHunt.co** - Curated palettes
- **WebAIM Contrast Checker** - Accessibility
- **Figma** - Test palettes in context
