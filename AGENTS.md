# AGENTS.md — Exposition Website codebase map

Read this first in any future session before touching this repo. It describes the structure, conventions, and content pipeline so you don't need to re-explore from scratch.

## What this is

A single-page marketing site for **Exposition**, the annual flagship business magazine of the Department of Industrial Management, University of Kelaniya, Sri Lanka. Built with **Astro 5** + **React islands** + **Tailwind** (base styles disabled, hand-written CSS drives the design) + **GSAP/Lenis** for scroll motion.

- Remote: `https://github.com/poru-03/expo-test.git` (`origin`)
- Live domain: `exposition.lk`
- Dev server: `npm run dev` → `astro dev` on port 4321
- Build: `npm run build` (outputs via `astro build`, catches type/syntax errors — always run before pushing)

**Important environment note:** the parent folder must not contain a `#` character — Vite/Astro's URL resolution breaks on it (was `E:\Exposition\Website #\web 3`, renamed to `E:\Exposition\Website\web 3`). If dev server errors mention "Failed to load url ... Does the file exist?", check the path first.

## Architecture: one page, many sections

There is **one route**, `src/pages/index.astro`. It composes `.astro` section components in order inside `<main>`. There is no multi-page routing — nav links are same-page anchors (`#id`) smooth-scrolled via Lenis (see `src/scripts/site.js`). Do not create new `src/pages/*.astro` routes for "Archive", "Legacy", "Partners", "Careers", etc. — these are sections on the one page, not separate pages.

Section order in `index.astro` (each is `src/components/<Name>.astro`):
`Hero → About → Imssa → Story → Events → Speakers → InterviewHighlights → Voices → Partners → Team → FeaturedCTA → Inside → Launch → Contact` then `Footer` outside `<main>`.

Each section follows the same shell convention:
```astro
<section class="section" id="<anchor>" data-ground="paper|ink">
  <div class="section__inner">
    <div class="section-head reveal">
      <span class="label label--gold">Eyebrow</span>
      <h2 class="display">Heading <em>emphasis</em></h2>
    </div>
    <!-- content -->
  </div>
</section>
```
- `data-ground="ink"` = dark section (triggers nav color inversion + adds `.grain` overlay conventionally); `"paper"` = light section.
- `.reveal` elements fade/slide in via GSAP (`site.js`); `.section__inner` itself is the primary riser.
- `.foil-num[data-count="N"]` = animated count-up number.
- `.hairline[data-rule]` = animated horizontal rule.
- `[data-parallax] img` = parallax image (used for plates/cover art).
- Interactive/stateful pieces are React islands under `src/components/islands/*.jsx`, hydrated with `client:visible` or `client:idle`, and imported directly into their `.astro` wrapper.

## Data-driven content

Section components pull copy/data from `src/data/*.js` rather than hardcoding arrays inline — **always edit the data file, not the component**, when updating rosters/lists:
- `events.js` — the 5 "event universe" spreads (podcast, forum, career fair, EXPO NEXT 10, tech hub)
- `partners.js` — partner org list
- `speakers.js` — `keynoteSpeakers` + `interviewHighlights` arrays
- `team.js` — organizing committee (currently placeholder names pending real OC roster)
- `testimonials.js` — `stats` + testimonial quotes (rotated by `VoicesCarousel.jsx`)
- `timeline.js` — `milestones` for the horizontal "Our Journey" story scroller

Components with a few hardcoded items inline (not worth a data file): `Nav.astro` (nav links), `Footer.astro` (nav+social links), `Inside.astro` (3 "inside issue" panels), `Contact.astro` (3 coordinator contact cards).

## Content source of truth

**[`Exposition Website — Issue 22 Content.md`](Exposition%20Website%20%E2%80%94%20Issue%2022%20Content.md)** (repo root) is the authoritative content brief — written as a 7-"page" content plan (Homepage, Archive, Legacy, Partner With Us, Careers, Contact, 404) but implemented as sections/anchors on the one real page, per the architecture above. It tags every block `[This Year]` (Issue 22-specific, swap annually) or `[Evergreen]` (persists), and has hard content rules worth internalizing:
- Never publish unconfirmed data as if confirmed (partnership tiers, team roster, launch mechanisms) — leave it out rather than guess.
- No personal phone numbers or personal emails anywhere on the site — role-based contacts only (`editorial@`, `partnerships@`, etc., or the general `exposition.uok@gmail.com`).
- No invented stats (e.g. the old site's fabricated "95% satisfaction rate").
- Every speaker/interviewee credibility tag must be independently verifiable — three were corrected from the old site's wrong tags (Mangala Karunarathne, Lakmini Wijesundera, Ranjith Pandithage); sources are cited inline in the doc.
- Update the footer copyright year on every rebuild — never ship a literal `[Year]` placeholder.

The doc's own Appendix ("Part 7 Kill-List Check") is a good diff against the old, previously-live site — useful for understanding what *not* to regress.

## Assets

- `public/assets/` — brand assets: logo, hero canvas dust texture, magazine cover, event "plates" (plate-01..05.webp), press/pour videos
- `public/people/` — speaker/testimonial headshots, filename-matched to `speakers.js`/`testimonials.js` entries
- `public/partners/` — partner logos (only a few orgs have logos on file; rest fall back to a generated monogram in the UI)

## Styling

All custom CSS lives in `src/styles/global.css` (Tailwind's base is disabled via `tailwind({ applyBaseStyles: false })` in `astro.config.mjs` — Tailwind utilities are available but the design system is hand-rolled, not utility-driven). Check this file for CSS custom properties (gold/ink color tokens, `--serif` font var, etc.) before introducing new colors/fonts.

## Workflow notes for this repo

- Commit incrementally as content/sections are updated, not as one giant diff — makes it easy to bisect if something regresses visually.
- Run `npm run build` before pushing to catch Astro/TS/JSX errors that the dev server sometimes swallows silently.
- Verify visually in the browser preview (dev server) after content changes — this is a heavily animated/visual site; a build pass alone doesn't catch layout or motion regressions.
