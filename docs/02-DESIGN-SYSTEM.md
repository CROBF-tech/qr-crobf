# Design System

## Visual Identity

A quiet, technical aesthetic built around clarity and function. The design communicates privacy, professionalism, and simplicity. Thin borders, generous spacing, and a single animated scan line as the visual signature.

---

## Color Palette

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#f8f6f1` | Page background (warm paper) |
| `--surface` | `#f2efe8` | Card/surface backgrounds |
| `--text` | `#1a1917` | Primary text (near-black) |
| `--text-soft` | `#57534e` | Secondary/muted text |
| `--accent` | `#c45c3e` | Primary accent (terracotta) |
| `--accent-soft` | `#e9c7ba` | Soft accent (for backgrounds, selection) |
| `--secondary` | `#3d5a5b` | Secondary accent (slate green) |
| `--border` | `#d6d3d1` | Borders and dividers |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#121210` | Page background |
| `--surface` | `#1c1b19` | Card/surface backgrounds |
| `--text` | `#f0ede6` | Primary text |
| `--text-soft` | `#a8a29e` | Secondary/muted text |
| `--accent` | `#d97757` | Primary accent (lighter terracotta) |
| `--accent-soft` | `#3a2a25` | Soft accent |
| `--secondary` | `#5b8a8b` | Secondary accent (lighter slate green) |
| `--border` | `#3a3733` | Borders and dividers |

### Tailwind CSS v4 Theme Mapping

The CSS variables are mapped to Tailwind utilities via `@theme inline`:

```css
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-text: var(--text);
  --color-text-soft: var(--text-soft);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --color-secondary: var(--secondary);
  --color-border: var(--border);
  /* ... font families */
}
```

Usage in components: `bg-bg`, `text-text`, `border-accent`, `text-accent`, `bg-surface`, `text-text-soft`, `text-secondary`, `bg-accent/10`, `border-secondary`, etc.

---

## Typography

| Role | Font | Fallback | Weights Used |
|------|------|----------|-------------|
| Displays/Headings | Space Grotesk | system-ui, sans-serif | 400, 500, 600, 700 |
| Body Text | Inter | system-ui, sans-serif | 400, 500, 600 |
| Code/Data | JetBrains Mono | SF Mono, monospace | 400, 500 |

### CSS Variables

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
--font-body: 'Inter', system-ui, sans-serif;
```

### Tailwind Utilities

- `font-display` — headings, titles, large text
- `font-mono` — technical text, labels, buttons, data, code values
- Default body font is Inter (set on `html` element)

### Text Styles

- Buttons: `font-mono uppercase tracking-wider text-xs`
- Labels: `font-mono text-xs uppercase tracking-wider text-text-soft`
- Eyebrow/overline: `font-mono text-xs uppercase tracking-[0.2em] text-accent`
- Hero title: `font-display text-[clamp(2rem,6vw,3.75rem)] font-semibold leading-[1.1] tracking-tight`
- Section heading: `font-display text-2xl md:text-3xl font-medium`
- Card title: `font-display text-lg md:text-xl font-medium leading-tight`
- Body: `text-sm md:text-base leading-relaxed text-text-soft`
- Small/meta: `font-mono text-xs text-text-soft`

---

## Components

### Button (`Button.tsx`)

- Font: `font-mono uppercase tracking-wider`
- 3 variants: `primary` (bg-text text-bg, hover:bg-accent), `secondary` (bg-surface, hover:bg-secondary hover:text-bg), `ghost` (transparent, hover:bg-accent-soft)
- 3 sizes: `sm` (px-3 py-2 text-[11px]), `md` (px-4 py-3 text-xs sm:text-sm), `lg` (px-6 py-4 text-sm)
- Transitions: `transition-all duration-200`
- Uses `touch-manipulation`

### Card (`Card.tsx`)

- Border: `border border-border`
- Background: `bg-surface`
- Optional header with title, description, and icon
- Content area: `p-4 md:p-6`

### Input (`Input.tsx`)

- Background: `bg-bg`
- Border: `border border-border`, focus: `border-accent`
- Placeholder: `placeholder:text-text-soft/50`
- Label: `font-mono text-xs uppercase tracking-wider text-text-soft`
- Helper text below input

### Select (`Select.tsx`)

- Same styling as Input (bg-bg, border border-border, focus:border-accent)
- Label: `font-mono text-xs uppercase tracking-wider text-text-soft`
- Disabled: `cursor-not-allowed opacity-50`

### Slider (`Slider.tsx`)

- Range input with `accent-accent` color
- Label left, value right (both `font-mono text-xs text-text-soft`)
- Value optionally suffixed with `unit` (e.g., "px")

### Toggle (`Toggle.tsx`)

- Checkbox with `accent-accent` color
- Label: `font-mono text-xs uppercase tracking-wider text-text-soft`
- Optional helper text

### ColorInput (`ColorInput.tsx`)

- Native `<input type="color">` with 36x36px swatch
- Label: `font-mono text-xs uppercase tracking-wider text-text-soft`

### GradientBuilder (`GradientBuilder.tsx`)

- Toggle checkbox to enable/disable gradient
- Select for type: `linear` | `radial`
- Dynamic color stops with color picker and offset slider
- Sub-sections indented with `border-l-2 border-border pl-3`

### FileUpload (`FileUpload.tsx`)

- Hidden `<input type="file">` triggered by styled button
- Preview thumbnail (64x64px) when file is selected
- "Change" and "Clear" buttons

### Section (`Section.tsx`)

- Title: `font-display text-sm font-medium`
- Bottom border separator (`border-b border-border pb-5 last:border-0`)

### CodeCustomizerPanel (`CodeCustomizerPanel.tsx`)

- Side panel: fixed width 340px on large screens (`lg:grid-cols-[1fr,340px]`)
- Scrollable content area (`overflow-y-auto`)
- Same surface/border styling as Card

### ToolCard (`ToolCard.astro`)

- Grid card with category badge, icon, title, description
- Hover: `hover:border-accent hover:bg-bg`
- Category: `font-mono text-[10px] uppercase tracking-[0.15em] text-accent`
- Arrow icon appears on hover with translate animation

---

## Spacing & Layout

- Max content width: `max-w-[1400px]`
- Horizontal padding: `px-4` (mobile), `px-6` (md+)
- Vertical section padding: `py-12 md:py-16` (sections), `py-14 md:py-20 lg:py-24` (hero)
- Gap scale: `gap-3`, `gap-4`, `gap-6`
- Card padding: `p-4 md:p-6`
- Thin borders throughout (`border border-border`)

---

## Dark Mode

- Toggled by `.dark` class on `<html>` element
- Persisted in `localStorage` key `"theme"`
- Respects `prefers-color-scheme: dark` on first visit
- Anti-flash script in layout runs before paint
- Smooth transitions: `transition-colors duration-200` on body
- Sun icon shown in dark mode, moon icon in light mode

---

## Animation

- **Scan line**: A horizontal line (`h-px bg-accent`) animates from top to bottom of the hero section over 4 seconds, repeating infinitely with ease-in-out
- Box shadow: `0 0 8px rgba(196, 92, 62, 0.6)`
- Respects `prefers-reduced-motion` (disables animation, centers line at 50%)
- Button/ToolCard hover transitions: `transition-colors duration-200`
- Language picker menu: `scale-95 opacity-0` to full scale/opacity

---

## Selection Style

```css
::selection {
  background-color: var(--accent-soft);
  color: var(--text);
}
```

## Focus Style

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

## Scrollbar Style

```css
::-webkit-scrollbar {
  width: 8px; height: 8px;
}
::-webkit-scrollbar-track { background: var(--surface); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: var(--text-soft); }
```

## Favicon/Logo

The SVG logo icon in the header is a QR-code-like grid pattern:
- Black background (`#1a1917`) with 6px border radius
- 4 terracotta (`#c45c3e`) squares forming a QR-like pattern
- 3 near-white (`#f5f0e9`) inner squares
- Total: 32x32 viewBox, rendered as an SVG in the header
