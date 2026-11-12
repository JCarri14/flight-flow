# FlightFlow — UX decisions

This document captures the decisions behind the current **selection-only** proof of concept. It is a design exploration, not an airline checkout product.

## 1. Start with the traveler's intention

Instead of asking someone to choose an airline's Light / Classic / Flex families, the wizard asks what they need. The prototype models cabin bags, checked bags, seat selection, nonstop flights, flexible changes, priority boarding, Fast Track and lounge access. The model resolves a fictional fare family and additional services internally.

## 2. Three progressive steps

**Route → Dates → Your trip.** One task is visible at a time. Date windows and extras use progressive disclosure; only high-frequency choices are visible by default. Optional minor-passenger controls stay collapsed when unused.

The step navigation is intentionally lightweight and sits outside the main card. The footer's primary button expands to the available width: **Continue** on steps 1–2 and **View flights** on step 3.

## 3. Reuse the wizard for editing

A results-page **Edit** action returns to the original centered wizard rather than introducing a new modal or condensed secondary form. Prior answers are prefilled. The user can jump directly between steps. Editing is transactional: nothing changes until **View flights** is confirmed; **Return** discards the draft.

## 4. Put flights ahead of search metadata

The results header includes route, trip type, dates, travelers and selected-need chips, with a single Edit action at the far edge. A dedicated summary card would compete with the actual flight recommendations.

The layout uses two compact horizontal recommendations where justified, not full fare-family cards. A single result may receive both **Cheapest** and **Best balance** badges when it wins both criteria. Price totals remain primary; a subordinate per-person price is shown only for a group of adults with the same individual fare.

The entire recommendation row is clickable and keyboard-operable. It highlights when selected. No separate **Select** or **View conditions** button is required on each row.

## 5. One clear end to the demonstration

After selection, **Finish demo** opens a brief informational screen with the selected route, type, dates, group size, recommendation and example total. It states explicitly that no ticket was purchased and that, in a real flow, passenger details and payment would come next.

The project intentionally does not implement those additional steps. That keeps the live demo focused on the core idea and avoids asking a colleague or portfolio visitor to enter personal data for a fictional booking. **Back to flights** retains the chosen offer; **New search** resets the wizard.

## 6. Animation and trust

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
