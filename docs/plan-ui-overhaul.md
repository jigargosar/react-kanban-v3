UI Overhaul Plan

Visual polish pass across all components. Make existing features
look production-grade without changing functionality. Better spacing,
contrast, typography, and visual hierarchy.

# Issues

## 1. No visual hierarchy

Sidebar, columns, cards, and background are all within 2-3% opacity
of each other. Nothing draws the eye. A first-time viewer doesn't
know where to look. Everything sits at the same visual plane.

## 2. Cards are invisible

Card surfaces (surface-raised) barely separate from column backgrounds
(white/[0.03]). Cards should be the most prominent elements — they're
the content. Currently they blend into the column.

## 3. Accent color underused

The teal accent is defined in the theme but only appears in the LIVE
badge and presence avatar ring pulse. The most colorful things on
screen are card covers (purple, blue) which aren't the accent at all.
The accent doesn't need to be everywhere, but nothing else creates
visual anchoring either. Something needs to create hierarchy.

## 4. Column headers too loud

Card title: text-[13px] text-white/80 (normal weight).
Column header: text-[13px] font-semibold uppercase tracking-wider text-white/70.

Even though the header has lower opacity, semibold + uppercase +
letter-spacing makes it visually heavier than the card text below it.
Headers should recede so cards pop. Hierarchy is inverted.

## 5. Sidebar is dead space

224px column with three board names, a faint "BOARDS" label, and
"+ New Board" at the bottom. The active board uses bg-white/[0.06]
which is nearly invisible against bg-white/[0.01]. No icon, no color
indicator, no visual cue that says "you are here." Takes up significant
screen real estate but contributes almost nothing visually.

# What stays

- Dot-grid background — adds atmosphere and texture. Once foreground
  contrast improves, it becomes a nice subtle backdrop.
- Label dots on cards — compact colored pills are intentional (same
  as Trello). Users who set labels know what the colors mean.
- Plus Jakarta Sans font — distinctive, not generic.
- oklch color system — solid foundation.

# Component Plan

## global.css

Add a third surface level for more depth. Refine dot-grid to be
more subtle once foreground contrast increases.

## Sidebar

Active board gets a visible indicator (left accent bar or similar).
Better active/hover contrast. Tighter spacing.

## Column headers

Drop all-caps. Sentence case with medium weight. Better text contrast.
Cleaner count badge. Headers should recede below card content.

## Cards

Increase padding. Subtle shadow or border on hover instead of just
border change. Better surface separation from column background.

## Header bar

Subtle refinements. Search input slightly wider.

## QuickEditPopup / CardDetailModal

Match the new card surface refinements for consistency.
