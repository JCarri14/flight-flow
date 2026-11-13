# FlightFlow — UX decisions

This document captures the decisions behind the current **selection-only** proof of concept. It is a design exploration, not an airline checkout product.

## 1. Start with the traveler's intention

Instead of asking someone to choose an airline's Light / Classic / Flex families, the wizard asks what they need. The prototype models cabin bags, checked bags, seat selection, nonstop flights, flexible changes, priority boarding, Fast Track and lounge access. The model resolves a fictional fare family and additional services internally.

## 2. Two interfaces over one search model

The proof of concept lets visitors compare two experiences without changing the underlying flight/fare logic:

- **Step by step (default):** low cognitive load, one question at a time.
- **Search bar:** direct entry for users who prefer editing the full itinerary in a horizontal bar. Non-primary settings stay in popovers.

The names refer to the interface layout, not to an unverified claim that one is faster. Switching modes preserves the complete draft. Dates stay flexible in both interfaces; the searchbar does not force users back to a traditional calendar. Both lead to the same results and informational end screen.

## 3. Three progressive steps

**Route → Dates → Your trip.** One task is visible at a time. Date windows and extras use progressive disclosure; only high-frequency choices are visible by default. Optional minor-passenger controls stay collapsed when unused.

For round trips, return choices are **Duration** or **Exact date** only. Duration already expresses a flexible range; a third “Flexible” option was redundant. **No preference** is bounded to **30 days** and is only a deterministic mock example, not an exhaustive live search.

The step navigation is intentionally lightweight and sits outside the main card. The footer's primary button expands to the available width: **Continue** on steps 1–2 and **View flights** on step 3.

## 4. Reuse the search mode for editing

A results-page **Edit** action returns to the same search interface (guided wizard or quick bar), rather than introducing a new editing modal. Prior answers are prefilled. In guided mode, the user can jump directly between steps. Editing is transactional: nothing changes until **View flights** is confirmed; **Return** discards the draft.

## 5. Put flights ahead of search metadata

The results header includes route, trip type, dates, travelers and selected-need chips, with a single Edit action at the far edge. A dedicated summary card would compete with the actual flight recommendations.

The layout uses two compact horizontal recommendations where justified, not full fare-family cards. Dates, times, and departure/arrival codes (where known) are displayed with clearer hierarchy and more separation between leg groups. A single result may receive both **Cheapest** and **Best balance** badges when it wins both criteria. Price totals remain primary; a subordinate per-person price is shown only for a group of adults with the same individual fare.

The entire recommendation row is clickable and keyboard-operable. It highlights when selected. No separate **Select** or **View conditions** button is required on each row.

## 6. One clear end to the demonstration

After selection, **Finish demo** opens a compact informational screen with the selected route, actual sample flight dates and times, party size, recommendation and example total. A single discreet disclaimer clarifies that no real ticket was purchased or payment made; in a real flow, passenger details and payment would come next.

The project intentionally does not implement those additional steps. That keeps the live demo focused on the core idea and avoids asking a colleague or portfolio visitor to enter personal data for a fictional booking. **Back to flights** retains the chosen offer; **New search** resets the wizard.

## 7. Animation and trust

Motion is limited to short transitions, optional disclosures, offer selection, mock searching and the informational end screen, with reduced-motion handling. The loading delay signals a change of search context, not real provider activity.

No UI element should imply that mock prices or airline availability were verified. A real application would need visible fare rules, baggage restrictions, a verified final total and any required consents before a real payment.

## Prior iterations (high level)

- Replaced a one-page form with a three-step wizard.
- Explored a side-panel editor, then returned to the original wizard for consistency.
- Replaced multi-card fare comparisons with one or two compact selectable rows.
- Merged the search summary into the results header.
- Added more dates and comfort preferences under optional disclosures.
- Integrated Lucide React, Motion for React and Plus Jakarta Sans.
- **v0.9.6:** ended the POC immediately after flight selection, matching the stand-alone HTML shareable demo.

- **v0.9.7:** added a second, horizontal entry mode sharing the exact same query, editing semantics, mock resolver and results.

- **v0.9.8:** clarified RT duration vs exact return, renamed search modes, strengthened flight date hierarchy and compacted the end screen.
