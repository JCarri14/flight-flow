# FlightFlow — Architecture notes (v0.9.8)

## Scope

A static, client-only React demonstration of **search → results → select flight → informational end screen**. There is no passengers form, checkout, mock purchase, backend, account, or payment integration.

## Flow state

`FlightFlowContext` owns the confirmed `FlightSearchQuery`, an editable draft, current step, furthest available step, resolved mock offers and the selected recommendation. It never stores passenger names, contact or card details. Refresh resets in-memory state.

The initial screen has two presentation components over the **same `FlightSearchQuery` draft**:

- `SearchWizard`: guided three-step route → dates → needs flow.
- `CompactSearch`: responsive bar with route inputs, direct trip-type selector and popovers for dates, travellers and needs.

`searchMode` lives in the provider. Switching modes never rewrites or clears the current draft; `submitSearch` is shared by both components. The wizard calls it from its final step, while the compact bar calls it directly.

The wizard is reused for initial search and editing:

- Initial search: only completed steps are navigable.
- Edit from results: return to the active mode with confirmed answers; guided mode reopens step 3 with all steps freely navigable.
- Cancel editing: discard changes and return to the existing results (selection preserved).
- **View flights** with an unchanged draft: reuse the existing offers without delay.
- **View flights** with changes: wait a short simulated loading period, recompute mock offers and reset the previous selection.

An offer row is an accessible button. Selecting one highlights it, and **Finish demo** navigates to `/complete` (hash route) only when there is a valid selection. The final screen displays the selected leg dates/times, itinerary context and an illustrative price, and offers **Back to flights** or **New search**. `/complete` is route-guarded when no selection exists.

## Provider-independent contracts

`FlightSearchQuery` holds user intent: routes, date range, traveler counts and needs. A round-trip return is either a duration band (`StayLength`) or an exact date (`ReturnMode`); “Flexible” was removed as a redundant return-mode option. No-preference duration has an explicitly communicated maximum of 30 days. The static resolver shows a deterministic sample return inside that boundary rather than pretending to search a 30-day inventory. `FlightOffer` contains the resolved route, full illustrative price, amenities and an internal fare-family code. The fare code is never displayed as a choice.

The mock resolver compares several itineraries and combinations of fictional fare bundles plus missing requested services. It can return one or two recommendations; the UI must not assume there are always two. Price-per-person is only shown for groups of equivalent adult fares.

The resolver is plain TypeScript, independent of React, and covered by a Node test suite.

## GitHub Pages

Vite emits a static `dist/` folder. React Router's `HashRouter` avoids server rewrite requirements. The GitHub Actions workflow derives Vite's base path from the repository name and publishes the static artifact.

## Out-of-scope production requirements

Real inventory and repricing, airline terms and restrictions, capacity management, aircraft/seat assignment, passenger details and travel documents, booking/payment orchestration, handling external provider failures and legal disclosures are intentionally outside this portfolio demonstration.
