---
name: Auditaxes Global Nexus
colors:
  surface: '#FFFFFF'
  surface-dim: '#c7ddf1'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf5ff'
  surface-container: '#e1f0ff'
  surface-container-high: '#d6ebff'
  surface-container-highest: '#d0e5f9'
  on-surface: '#071d2c'
  on-surface-variant: '#3e484e'
  inverse-surface: '#1e3242'
  inverse-on-surface: '#e6f2ff'
  outline: '#6e797f'
  outline-variant: '#bdc8cf'
  surface-tint: '#006686'
  primary: '#006686'
  on-primary: '#ffffff'
  primary-container: '#26a9d8'
  on-primary-container: '#00394d'
  inverse-primary: '#6ed2ff'
  secondary: '#4b6171'
  on-secondary: '#ffffff'
  secondary-container: '#cbe3f5'
  on-secondary-container: '#4f6575'
  tertiary: '#00658b'
  on-tertiary: '#ffffff'
  tertiary-container: '#46a7d9'
  on-tertiary-container: '#003951'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bfe8ff'
  primary-fixed-dim: '#6ed2ff'
  on-primary-fixed: '#001f2b'
  on-primary-fixed-variant: '#004d65'
  secondary-fixed: '#cee6f8'
  secondary-fixed-dim: '#b2cadc'
  on-secondary-fixed: '#041e2b'
  on-secondary-fixed-variant: '#334958'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7fd0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#f6f9ff'
  on-background: '#071d2c'
  surface-variant: '#d0e5f9'
  background-wash: '#F4FAFD'
  border-subtle: '#D6E6EE'
  text-muted: '#5F7380'
  petroleum-dark: '#162936'
  petroleum-active: '#24495A'
  primary-dark: '#0E749C'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 88px
    fontWeight: '300'
    lineHeight: 96px
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  section-gap: 120px
---

## Brand & Style

The design system is engineered for a top-tier international financial network, blending the authority of global auditing with the sleek sophistication of high-end technology. The brand personality is **authoritative, visionary, and meticulously precise**. 

The aesthetic draws heavily from **Modern Minimalism** and **Editorial Design**. It prioritizes vast negative space to communicate clarity and "breathing room" for complex financial data. Every element is intentional, avoiding decorative clutter in favor of structural elegance and high-value architectural imagery. The emotional goal is to instill absolute confidence and a sense of premium intelligence through understated luxury.

## Colors

The palette is anchored by **Petroleum (#1D3442)**, a deep, intelligent blue that replaces traditional black for a more sophisticated, high-finance feel. **Strategic Cyan (#26A9D8)** acts as a precision tool—used sparingly for call-to-actions, active states, and data highlights to guide the eye without overwhelming the editorial calm.

The background uses a **Cool Wash (#F4FAFD)** rather than pure white to reduce visual fatigue and enhance the "premium tech" atmosphere. Surfaces where content lives are kept at pure `#FFFFFF` to provide maximum contrast and a sense of layered depth.

## Typography

The system utilizes **Inter** for its neutral, highly legible, and systematic qualities. The typographic hierarchy follows an editorial rhythm:
- **Large Headlines:** Use light weights (`300` or `400`) and tight letter spacing to create a high-fashion, premium look.
- **Micro-Copy:** Functional labels and small captions should use increased letter spacing and uppercase styling to maintain clarity at small scales.
- **Vertical Rhythm:** Line heights are generous (`1.5x` for body) to ensure data-heavy consulting reports remain approachable and easy to scan.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop to maintain a cinematic, controlled composition. 
- **The 12-Column Grid:** Content is centered within a 1280px or 1440px max-width container. 
- **Aggressive Whitespace:** Large section gaps (120px+) are used to separate distinct service areas, mimicking the layout of a luxury print magazine.
- **Responsive Reflow:** On mobile, margins shrink to 20px, and grid columns collapse to a single stack. Spacing between elements is halved, but the "breathability" is maintained by reducing font sizes significantly to avoid crowded viewports.

## Elevation & Depth

To maintain the "Apple-inspired" refinement, this design system avoids heavy drop shadows. Instead, it uses:
- **Tonal Layering:** Depth is created by placing `Surface` white cards on the `Background-Wash` bluish-white tint.
- **Fine Borders:** A 1px border in `Border-Subtle (#D6E6EE)` defines containers without adding visual weight.
- **Ambient Shadows:** Where elevation is necessary (e.g., dropdowns or hovering over cards), use an extremely diffused shadow: `0px 20px 40px rgba(16, 37, 52, 0.04)`. The shadow color is tinted with the Petroleum neutral to ensure it looks natural against the cool background.

## Shapes

The shape language is **structured and geometric**. 
- **Standard Elements:** Buttons, cards, and input fields use a `0.5rem` (8px) radius. This provides a modern, friendly touch while maintaining a professional "square" silhouette.
- **Interactive States:** Avoid "pill" shapes for buttons to maintain the serious, corporate tone. High-impact containers may occasionally use `1rem` (16px) for a softer, more modern tech feel in marketing sections.

## Components

### Buttons
- **Primary:** Petroleum background (`#1D3442`) with White text. Sleek, rectangular with 8px radius. 
- **Secondary:** Transparent background with Primary Cyan (`#26A9D8`) border and text.
- **Tertiary:** Text-only with a trailing "chevron" icon for "Learn More" actions.

### Cards & Containers
- Cards should have no shadow by default, only the `Border-Subtle`. 
- On hover, cards lift slightly with an `Ambient Shadow` and the border color shifts to `Primary Cyan`.

### Input Fields
- Understated design: 1px border on all sides or just a bottom-border for a more "architectural" look.
- Use `Text-Muted` for placeholders and `Petroleum` for active input.

### Navigation
- A "Sticky" top navigation bar using `Petroleum-Dark (#162936)` with white text for a high-contrast, authoritative "Global Header" feel.

### Data Visualization
- Charts should use the `Primary` and `Secondary` ranges. Use clear, thin lines and avoid gradients in data to maintain the precision-focused "Audit" aesthetic.