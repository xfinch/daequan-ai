# Animation Patterns

Motion design separates good sites from award-winning ones. Use animation intentionally, not decoratively.

---

## Animation Philosophy

### Rules:
1. **Purposeful**: Every animation guides or delights
2. **Performant**: 60fps or don't do it
3. **Consistent**: Same easing, same timing
4. **Respectful**: Honor prefers-reduced-motion
5. **Subtle**: Understated > flashy

### Timing Standards:
```
Micro (hover, toggle): 150-300ms
Standard (reveals): 400-600ms  
Dramatic (page transitions): 800-1200ms
Ambient (continuous): 10-20s loops
```

### Easing Functions:
```css
/* Standard - natural feel */
cubic-bezier(0.4, 0, 0.2, 1)

/* Entrance - decelerate */
cubic-bezier(0, 0, 0.2, 1)

/* Exit - accelerate */
cubic-bezier(0.4, 0, 1, 1)

/* Bounce - playful */
cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

## Page Load Sequence

### The Award-Winning Entrance:

1. **Background fade** (0-200ms)
   - Solid color or gradient fades in
   - Sets the stage

2. **Logo reveal** (200-500ms)
   - Fade or scale from 0.9
   - Establish brand

3. **Navigation slide** (300-600ms)
   - Fade in or slide down
   - 50ms stagger between items

4. **Headline split** (500-1000ms)
   - Character or word stagger
   - 20-30ms between elements
   - Use SplitType or GSAP SplitText

5. **Subhead fade** (800-1200ms)
   - Simple fade up
   - 30px translateY

6. **CTA entrance** (1000-1400ms)
   - Scale from 0.9 or fade up
   - Ready for interaction

### GSAP Implementation:
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

tl.from(".bg", { opacity: 0, duration: 0.3 })
  .from(".logo", { opacity: 0, y: -20, duration: 0.5 }, "-=0.2")
  .from(".nav-item", { opacity: 0, y: -10, stagger: 0.05 }, "-=0.3")
  .from(".headline-char", { opacity: 0, y: 50, stagger: 0.02 }, "-=0.4")
  .from(".subhead", { opacity: 0, y: 30 }, "-=0.5")
  .from(".cta", { opacity: 0, scale: 0.9 }, "-=0.4");
```

---

## Scroll-Triggered Animations

### Patterns:

**Fade Up (Most Common):**
```javascript
gsap.from(".fade-up", {
  scrollTrigger: {
    trigger: ".fade-up",
    start: "top 80%",
    toggleActions: "play none none reverse"
  },
  opacity: 0,
  y: 50,
  duration: 0.8,
  ease: "power2.out"
});
```

**Staggered Grid:**
```javascript
gsap.from(".grid-item", {
  scrollTrigger: {
    trigger: ".grid",
    start: "top 75%"
  },
  opacity: 0,
  y: 30,
  duration: 0.6,
  stagger: 0.1,
  ease: "power2.out"
});
```

**Parallax Layers:**
```javascript
gsap.to(".parallax-bg", {
  scrollTrigger: {
    trigger: ".section",
    start: "top bottom",
    end: "bottom top",
    scrub: 1
  },
  y: -100,
  ease: "none"
});
```

**Pin and Reveal:**
```javascript
ScrollTrigger.create({
  trigger: ".pinned-section",
  start: "top top",
  end: "+=1000",
  pin: true,
  scrub: 1
});
```

---

## Hover Interactions

### Button Hover:
```css
.button {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
.button:active {
  transform: translateY(0);
}
```

### Link Underline Draw:
```css
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
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.link:hover::after {
  width: 100%;
}
```

### Card Lift:
```css
.card {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s ease;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}
```

### Image Zoom:
```css
.image-wrapper {
  overflow: hidden;
}
.image-wrapper img {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.image-wrapper:hover img {
  transform: scale(1.05);
}
```

---

## Page Transitions

### Fade Transition:
```javascript
// Exit
await gsap.to(".page", { 
  opacity: 0, 
  duration: 0.3 
});

// Change route

// Enter
gsap.from(".page", { 
  opacity: 0, 
  duration: 0.5,
  delay: 0.1
});
```

### Slide Transition:
```javascript
// Exit
await gsap.to(".page", { 
  x: -50, 
  opacity: 0, 
  duration: 0.3 
});

// Enter
gsap.from(".page", { 
  x: 50, 
  opacity: 0, 
  duration: 0.5 
});
```

---

## Text Animations

### Character Split:
```javascript
import SplitType from 'split-type';

const text = new SplitType('.headline', { types: 'chars' });

gsap.from(text.chars, {
  opacity: 0,
  y: 50,
  rotateX: -90,
  stagger: 0.02,
  duration: 0.8,
  ease: "power2.out"
});
```

### Word Reveal:
```javascript
const text = new SplitType('.reveal-text', { types: 'words' });

gsap.from(text.words, {
  scrollTrigger: {
    trigger: '.reveal-text',
    start: "top 80%"
  },
  opacity: 0,
  y: 20,
  stagger: 0.05,
  duration: 0.6
});
```

### Typewriter Effect:
```javascript
const text = "Your headline here";
const element = document.querySelector('.typewriter');

gsap.to(element, {
  duration: text.length * 0.05,
  text: text,
  ease: "none"
});
```

---

## Continuous Animations

### Floating Elements:
```javascript
gsap.to(".floating", {
  y: -20,
  duration: 2,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1
});
```

### Gradient Shift:
```css
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animated-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}
```

### Breathing Scale:
```javascript
gsap.to(".breathing", {
  scale: 1.05,
  duration: 3,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1
});
```

---

## Accessibility

### Respect Reduced Motion:
```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  // Initialize animations
}
```

### CSS Alternative:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Tips

1. **Use transform and opacity** - GPU accelerated
2. **Avoid animating width/height** - Triggers layout
3. **Use will-change sparingly** - Add before, remove after
4. **Batch animations** - Group in timelines
5. **Use requestAnimationFrame** - For custom animations
6. **Test on real devices** - Especially mid-range Android
