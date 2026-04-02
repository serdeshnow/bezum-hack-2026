# Stage 10: UI Convergence With Figma

## Goal

Bring `frontend` visually much closer to the `figma` prototype without breaking the FSD structure and the already implemented product flows.

## What changed

- Rebased the visual foundation onto the `figma` palette:
  - warm paper background
  - stone cards
  - sage accent
  - softer borders and shadows
- Relaxed text rhythm and spacing:
  - less compressed display headings
  - larger paragraph line-height on content-heavy surfaces
  - roomier card and section spacing
- Introduced a display heading style close to the mockup mood using `Oswald` as the local fallback for the `Coolvetica`-like headings used in `figma`.
- Updated shared primitives:
  - `Card`
  - `Badge`
  - `Progress`
- Restyled the main product shell:
  - sidebar
  - header
  - action buttons
  - project switcher
  - inbox/meta block
- Restyled the most visible backbone screens first:
  - `Projects Hub`
  - `Project Overview`
- Continued the visual pass into execution and planning screens:
  - `Epoch Workspace`
  - `Kanban Board`
  - `Documentation Hub`
  - `Meeting Scheduler`
- Continued with surgical spacing/layout fixes on the remaining large surfaces:
  - `Document Editor`
  - `Meeting Recap`
  - `Release Dashboard`
  - `Unified Inbox`
- Added a dedicated responsive desktop pass:
  - more fluid shell width for laptop and large monitor layouts
  - later two-column splits on dense screens to avoid crushed content
  - responsive display heading scaling instead of one fixed desktop size
  - Kanban columns now wrap into grids before they overflow the viewport
  - `Task Details` and `Document History` were moved off the older cold `slate-*` styling and aligned with the same spacing and token system
- Added a figma-pattern primitive pass:
  - shared `ui-btn` button sizing instead of many one-off button class strings
  - shared `ui-control` inputs/selects/textareas with consistent internal padding
  - shared `ui-panel` inner surfaces that clip overflow and keep content inside boxes
  - shared `ui-segment` tab/toggle groups with the same interaction rhythm across screens
- Increased base spacing after visual feedback:
  - larger default `Card` padding
  - roomier `ui-panel` padding for nested content blocks
  - explicit shell-side page gutters so the left sidebar no longer visually sticks to the viewport edge

## Spacing focus

This pass was intentionally not a structural rewrite. The focus was:

- increase internal padding on dense cards
- improve vertical rhythm on body copy and metadata rows
- reduce overly tight heading line-height where text looked collapsed
- align action areas and side panels more consistently
- make text align to its container, not only to adjacent text blocks
- keep dense screens readable on laptop widths without making large monitors feel empty
- stop text from visually sticking to borders inside buttons, fields, and small panels
- reduce per-screen drift by moving repeated control styling into shared primitives

## Responsive notes

- The biggest structural issue was not raw padding values but breakpoint timing:
  - several widgets split into sidebars or 4-5 card rows too early at `xl`
  - with the app shell present, that left too little real content width on laptops
- This pass moves the densest layouts to `2xl` where appropriate and keeps intermediate desktop widths in 1-3 column compositions.
- The shell width is now more fluid, so large monitors get more horizontal room while laptop layouts keep safer spacing.
- Heading sizes are now scaled through global responsive rules for `.font-heading` displays, which keeps the mockup mood without oversized titles on smaller desktop screens.

## Why this order

This gives the highest visual leverage with the lowest rewrite risk:

1. Shared tokens affect the whole app.
2. Shared primitives affect nearly every page.
3. Shell changes affect every route.
4. Backbone pages are the first screens seen in demo and navigation.

## Intentional compromise

The `figma` project uses fonts like `Europe` and `Coolvetica`, but those files are not available in `frontend/public`. For now we use:

- body: `Inter`
- display/headings: `Oswald`

This keeps the mood closer to the mockup while staying fully local and build-safe.

## Next visual passes

- Align `Epoch Workspace`, `Kanban`, `Docs Hub`, `Document Editor`, `Meeting Scheduler`, `Release Dashboard`, and `Unified Inbox` to the same visual language.
- Replace remaining `slate-*` hardcoded Tailwind colors in high-traffic widgets with the new warm token palette.
- If the exact mockup fonts are later added to `frontend/public/fonts`, switch the heading and body stacks to match `figma` more closely.
- Run a browser-by-browser visual pass specifically at laptop and large-monitor widths to fine-tune any remaining local alignment issues that only show up with real rendered content.
