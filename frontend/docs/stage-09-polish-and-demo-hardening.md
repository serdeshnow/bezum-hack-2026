# Stage 09: Polish and Demo Hardening

## Goal

Prepare the product for a stable hackathon demo and reduce the gap between a working prototype and a presentable service.

## Why This Stage Matters

By this point, the core slices already exist:

- backbone
- tasks
- docs
- meetings
- delivery
- notifications

The remaining risk is not missing architecture anymore. It is demo fragility:

- the story is harder to present if there is no explicit walkthrough
- the shell feels less product-like if key counters stay static
- route-level regressions are easy to miss without an end-to-end check

## What Was Improved

### Projects Hub

`Projects Hub` now includes an explicit `Demo Flow` section.

It gives us a stable walkthrough path for the presentation:

1. project overview
2. task workspace
3. linked document
4. meeting recap
5. release dashboard
6. unified inbox

This makes the demo reproducible instead of depending on ad-hoc route jumping.

### Shell

`TemplateShell` now uses live data for:

- project switcher options
- inbox summary counts
- role/inbox context panel

That means the global shell is no longer just decorative scaffolding. It reflects the actual product state we built in the previous stages.

### Tests

The test layer now covers the demo path more directly:

- unit test checks the walkthrough section on the landing page
- e2e test verifies the main connected route chain across the product

This reduces the chance that a late-stage route or navigation regression breaks the live demo.

## Files Touched In This Stage

- `widgets/projects-hub/model/projectsHub.ts`
- `widgets/projects-hub/ui/ProjectsHub.tsx`
- `widgets/layout/ui/template-shell/TemplateShell.tsx`
- `tests/unit/home-page.test.tsx`
- `tests/e2e/template-shell.spec.ts`

## What This Stage Does Not Try To Finish

This stage improves readiness, but it does not claim pixel-perfect parity with the figma source yet.

The current focus was:

- demo clarity
- shell realism
- route stability

If we continue polishing after this, the next natural direction is visual convergence:

- deeper alignment of composition and spacing with figma
- stronger loading and empty-state variety
- final copy cleanup
