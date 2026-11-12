# FlightFlow ✈️

> **What if finding a flight was as simple as describing how you want to travel?**

FlightFlow is an independent, bilingual (ES/EN) **flight search and selection proof of concept**. It explores an intent-first search, invisible fare-family resolution, and a short, progressively disclosed booking entry point.

**This demo intentionally stops after flight selection.** It does not collect passenger identities or payment details, make bookings, send emails, or issue tickets. Routes, departure times, prices, fare availability and benefits are fictional.

## Demo flow

1. **Route** — Enter origin and destination; choose one way or round trip. Starts at **Barcelona → Madrid, one way** to match the standalone HTML demo.
2. **Dates** — Search by flexible windows, precise dates, or trip length. More date ranges are available on demand.
3. **Your trip** — Set traveller counts and required amenities. Adults and four core needs appear first; children, infants and extra preferences can be expanded.
4. **Flight results** — Compare the cheapest complete offer with a better-balanced alternative only when its benefit is meaningful. Click an entire flight row to choose; no commercial fare-family grid is shown. For equivalent adult fares, group total and per-person amounts are displayed.
5. **Finish demo** — After selecting a flight, press **Finish demo** to see an informational end screen with your chosen itinerary, total illustrative price and a clear statement of what a real booking would do next. Return to results or start a new search.

To edit a search, **Edit** returns to the **same wizard** with the previous answers preserved. Search results are only replaced after confirming changes on step 3; cancelling preserves the current results and selection.

## Main product ideas

- **Intent, not fare jargon.** People choose the requirements (cabin baggage, seat selection, flexible changes etc.) instead of memorising Light, Classic or Flex.
- **Automated fare resolution.** A deterministic mock resolver compares fictional bundles plus à-la-carte services and chooses the least expensive valid combination for each itinerary.
- **Meaningful recommendations.** Show only one recommendation if the lowest price is also the best price/convenience trade-off. Otherwise show up to two.
- **Less noise.** The search summary is part of the results heading, not a separate competing card. Clicking a result selects it directly.
- **Transparent scope.** The final screen confirms flight selection only. A real product would continue to passengers, validated conditions and payment, without an ancillary upsell stage.

For rationale, see [UX decisions](docs/UX_DECISIONS.md), [fare model](docs/FARE_MODEL.md), [architecture](docs/ARCHITECTURE.md) and [visual system](docs/VISUAL_SYSTEM.md).

## What's new in v0.9.6

- Removed the passengers, payment, and simulated purchase pages and their state/contracts.
- Added a concise **selection complete** informational screen, matching the standalone HTML demo.
- Kept a separate selection gesture and **Finish demo** action so the user can compare or change flights before ending.
- Added **Back to flights** and **New search** controls on the final screen.
- Updated all active copy, ES/EN translations, routes, tests and docs to reflect this limited scope.
- Preserved the FlightFlow v0.9.5 visual polish: **Lucide React**, **Motion for React**, **Plus Jakarta Sans Variable** and responsive design.

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
