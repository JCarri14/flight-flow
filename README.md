# FlightFlow ✈️

> **What if finding a flight was as simple as describing how you want to travel?**

FlightFlow is an independent, bilingual (ES/EN) **flight search and selection proof of concept**. It explores an intent-first search, invisible fare-family resolution, and **two interchangeable search experiences**: a step-by-step wizard and a compact flight search bar.

**This demo intentionally stops after flight selection.** It does not collect passenger identities or payment details, make bookings, send emails, or issue tickets. Routes, departure times, prices, fare availability and benefits are fictional.

## Demo flow

Choose **Step by step** (default) or **Search bar** on the landing screen. Both share the same in-memory query and mock pricing engine, and switching modes preserves your answers.

**Step by step** has three steps:

1. **Route** — Enter origin and destination; choose one way or round trip. Starts at **Barcelona → Madrid, one way** to match the standalone HTML demo.
2. **Dates** — Search by flexible windows, precise dates, or trip length. More date ranges are available on demand.
3. **Your trip** — Set traveller counts and required amenities. Adults and four core needs appear first; children, infants and extra preferences can be expanded.
**Search bar** offers those same settings in a responsive horizontal bar: origin, destination, date windows (including exact dates), optional return, passenger counts, and a preferences popover with all eight requirements. It also starts with **Barcelona → Madrid, one way**. Date options and requirements can be expanded without opening a separate page.

For round trips, return is either **Duration** (a stay range) or **Exact date**. The former includes an explicit **No preference (up to 30 days)** option; there is no ambiguous separate “Flexible return” mode.

After submitting either mode, the same results follow:

4. **Flight results** — Compare the cheapest complete offer with a better-balanced alternative only when its benefit is meaningful. Click an entire flight row to choose; no commercial fare-family grid is shown. For equivalent adult fares, group total and per-person amounts are displayed.
5. **Finish demo** — After selecting a flight, press **Finish demo** to see a compact informational screen showing the specific selected departure/return dates, times, the illustrative total, and what a real booking would do next. Return to results or start a new search.

To edit a search, **Edit** returns to the **same search mode** with the previous answers preserved. You can also switch between modes during editing. Search results are only replaced after confirming changes on step 3; cancelling preserves the current results and selection.

## Main product ideas

- **Intent, not fare jargon.** People choose the requirements (cabin baggage, seat selection, flexible changes etc.) instead of memorising Light, Classic or Flex.
- **Automated fare resolution.** A deterministic mock resolver compares fictional bundles plus à-la-carte services and chooses the least expensive valid combination for each itinerary.
- **Meaningful recommendations.** Show only one recommendation if the lowest price is also the best price/convenience trade-off. Otherwise show up to two.
- **Less noise.** The search summary is part of the results heading, not a separate competing card. Clicking a result selects it directly.
- **Transparent scope.** The final screen confirms flight selection only. A real product would continue to passengers, validated conditions and payment, without an ancillary upsell stage.

For rationale, see [UX decisions](docs/UX_DECISIONS.md), [fare model](docs/FARE_MODEL.md), [architecture](docs/ARCHITECTURE.md) and [visual system](docs/VISUAL_SYSTEM.md).

## What's new in v0.9.8

- Renamed the two presentation choices to **Step by step / Search bar** (**Paso a paso / Barra de búsqueda** in Spanish).
- Simplified the round-trip return contract to **Duration / Exact date** in both modes. Duration supports weekend, 1–3, 4–7, 8–14, 15–21 days, or a no-preference window bounded to 30 days; the mock resolver uses an illustrative return within that boundary instead of querying real inventory.
- Flight comparison rows now make the **actual example flight date** more prominent and show departure/arrival times, sample city/airport codes when known, connections, duration, and total price with clearer spacing.
- Replaced the tall confirmation table and warning box with a **compact selected-itinerary summary**, including real example leg dates and times. The demo disclaimer is a single small line.
- Maintained ES/EN, responsive layouts, accessible selection, Lucide, Motion, reduced-motion support, shared search state, and the existing Cloudflare Web Analytics snippet.


## Technology

| | |
| --- | --- |
| UI | React 19, TypeScript, Vite 7 |
| Navigation | React Router 7 `HashRouter` (compatible with GitHub Pages) |
| State | Context + React hooks; no persistence of personal data |
| Icons | Lucide React |
| Transitions | Motion for React with reduced-motion support |
| Font | Self-hosted Plus Jakarta Sans Variable |
| Domain logic | Pure TypeScript mock fare resolver |
| Tests | Node built-in runner + TypeScript |
| Hosting | GitHub Pages + GitHub Actions workflow |

## Run locally

Requires a Node.js version supported by Vite 7 (Node 22 recommended).

```bash
npm install
npm run dev
```

For a production build and domain tests:

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

The distribution does not include `node_modules` or `package-lock.json`. Run `npm install` locally, then commit the generated `package-lock.json` for reproducible CI builds.

## Deploy to GitHub Pages

1. Create a GitHub repository, for example `flightflow`.
2. Put the project in the repository root and run `npm install` to produce a lock file.
3. Commit and push to `main`.
4. Open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
5. The included `.github/workflows/deploy.yml` tests, builds and deploys the static `dist/` folder.

The workflow sets Vite's `base` path automatically for a project site (`/<repo>/`) or an account site (`/`). All app navigation stays behind URL hashes, so browser refreshes work without server rewrites.

## Directory map

```text
src/
  App.tsx
  core/
    flight.model.ts            # Search contracts, date/party validation
    mock-offer-resolver.ts      # Flight, internal fare + services selection
  features/
    SearchWizard.tsx           # Three steps reused in edit mode
    CompactSearch.tsx          # Horizontal alternate search with popovers
    FlightResults.tsx          # Compact, clickable recommendations
    SelectionComplete.tsx      # Informational end screen (no checkout)
  state/
    FlightFlowContext.tsx      # Confirmed query, edit draft, offers, selection
  i18n/LanguageContext.tsx     # ES/EN copy
  components/Shared.tsx
  components/AboutConcept.tsx
  styles/main.css
.github/workflows/deploy.yml
tests/core.test.mjs
docs/
```

## Production boundaries

This is not an airline offer-search service. A real flight purchase would require live inventory, repricing, carrier rules, tax and fee disclosure, baggage and seat confirmation, traveler identity/age/document requirements, secure payments and booking APIs. No credentials, payment information or airline integrations belong in this public POC.

Screenshots from airline purchase flows were used as research references for service categories, not copied as design assets or used to obtain real pricing.

## Updating an existing Git repository

Do not copy a new ZIP over an old project without reviewing deletions: obsolete files may remain and TypeScript may still try to compile them. For a straightforward v0.9.7 → v0.9.8 upgrade, use the accompanying **changed-files ZIP**, which updates only the edited/new files without changing the rest of your repo. Inspect `git status`, then run `npm test` and `npm run build` before pushing.

The included Cloudflare Web Analytics site token is a public client-side site identifier, not an API secret.
