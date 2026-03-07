# Standor — Design System

## Philosophy

Human-crafted, clean, high-readability. Inspired by Linear and Vercel.
**No purple. No gradient overload. No neon vibe-coded palettes.**

---

## Color Palette

| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `primary-600` | Teal 600 | `#0d9488` | CTA buttons, links, brand accent |
| `primary-400` | Teal 400 | `#2dd4bf` | Hover glows, AI score display |
| `accent-500` | Amber 500 | `#f59e0b` | Warning badges, AI score highlight |
| `surface` | Slate 50 | `#f8fafc` | Page background |
| `surface-dark` | Slate 900 | `#0f172a` | Room/editor dark background |
| `surface-dark-card` | Slate 800 | `#1e293b` | Dark mode card surfaces |
| Text primary | Neutral 900 | `#0f172a` | Body text |
| Text muted | Slate 500 | `#64748b` | Secondary text, labels |
| Border | Slate 200 | `#e2e8f0` | Card/input borders |

### Semantic colors

- Success: Emerald 600 `#059669`
- Error: Rose 600 `#e11d48`
- Warning: Amber 500 `#f59e0b`
- Info: Sky 600 `#0284c7`

---

## Typography

| Scale | Size | Weight | Use |
|-------|------|--------|-----|
| Display | `clamp(2rem,5vw,3.5rem)` | 900 | Hero headline |
| Display-sm | `clamp(1.5rem,3vw,2.5rem)` | 900 | Section headers |
| h1 | 32px | 800 | Page title |
| h2 | 24px | 700 | Section title |
| h3 | 18px | 600 | Card title |
| Body | 16px | 400 | Default text |
| Small | 14px | 400 | Secondary text |
| XS | 12px | 400–600 | Labels, badges |
| Mono | 14px | 400 | Code, room IDs |

**Font families:**
- UI: Inter (`var(--font-inter)`)
- Code: JetBrains Mono (`var(--font-jetbrains)`)

---

## Spacing

8px grid system. Key values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.

---

## Shadows

| Token | CSS | Use |
|-------|-----|-----|
| `shadow-card` | `0 1px 3px rgb(0 0 0/4%), 0 1px 2px -1px rgb(0 0 0/4%)` | Default card |
| `shadow-card-hover` | `0 4px 20px rgb(0 0 0/8%), 0 2px 8px -2px rgb(0 0 0/6%)` | Card on hover |
| `shadow-glow-teal` | `0 0 24px rgb(13 148 136/35%)` | CTA button hover |

---

## Border Radius

- `rounded-lg` (8px): inputs, small buttons
- `rounded-xl` (12px): buttons, cards
- `rounded-2xl` (16px): large cards
- `rounded-3xl` (24px): hero cards, modals
- `rounded-full`: avatars, icon buttons, badges

---

## Component Designs

### Button — Primary (`.btn-primary`)
- Background: `primary-600`, hover: `primary-700`
- Text: white, 14px semibold
- Padding: 10px 20px
- Radius: 12px
- Icon gap: 8px
- Active: `scale(0.98)`
- Focus: 2px offset ring in `primary-600`

### Button — Secondary (`.btn-secondary`)
- Background: white, border: `slate-200`
- Hover: border `primary-300`, text `primary-700`
- Same shape/size as primary

### Card (`.card`)
- Background: white
- Border: `1px solid slate-100`
- Radius: 16px
- Shadow: `shadow-card` → `shadow-card-hover` on hover
- Padding: 20–24px

### Input (`.input`)
- Border: `slate-200`, focus: `primary-400` + ring
- Radius: 12px, padding: 10px 16px
- Icon slots: `pl-9` (left icon)

### Badge
- Height: 20px, rounded-full
- Types: teal (success/info), amber (warning), slate (neutral), rose (error)

---

## Motion Guidelines

| Type | Duration | Easing |
|------|----------|--------|
| Micro (button press, toggle) | 150ms | ease |
| Content enter (fade/slide) | 300–400ms | `cubic-bezier(0.22,1,0.36,1)` |
| Page transition | 250ms | ease-out |
| Hero loop | 8–12s | ease-in-out |
| Stagger children | 80–100ms delay per item | — |

Always include `@media (prefers-reduced-motion: reduce)` to disable non-essential animation.

---

## 3D Hero — Brief

**Concept:** "Signal extraction" — a field of noisy particles that slowly converge to a clear geometric node (icosahedron) when the user interacts. Represents the AI extracting signal from messy code.

**Implementation:**
- `react-three-fiber` + `@react-three/drei`
- No GLTF assets — pure procedural geometry (< 50KB JS)
- Particle field: 500 points, `THREE.Points` with `BufferGeometry`
- Central orb: `IcosahedronGeometry` with `MeshDistortMaterial`
- Mouse tilt: `useFrame` + `pointer.x/y` → smooth `lerp` rotation
- Auto-rotate: `OrbitControls` `autoRotate` at 0.4 rpm
- DPR cap: `dpr={[1, 1.5]}` — never exceeds 1.5× for performance
- Fallback: `loading` prop on `dynamic()` shows CSS pulse animation

**Performance targets:**
- FPS ≥ 45 on mid-range device (e.g. 2019 MacBook Pro)
- LCP unaffected — hero is `dynamic` with `ssr: false`
- Lighthouse Performance ≥ 85

**Accessibility:**
- `role="img"` with `aria-label` on the canvas container
- `prefers-reduced-motion`: disable rotation, freeze animation

---

## Accessibility

- Minimum WCAG AA contrast (4.5:1 for normal text, 3:1 for large)
- All interactive elements: visible `:focus-visible` ring
- All icon-only buttons: `aria-label`
- No color-only information (always pair with text or icon)
- Keyboard navigation: tab order follows visual order
- Screen reader: semantic HTML headings, landmark regions (`nav`, `main`, `footer`)
