# Mock fare model — internal only

FlightFlow is not connected to Iberia Express, LEVEL or any other airline. Examples of airline fare-selection screens informed the **categories of benefits** and the need for a simplified interface, but no real inventory, fare prices, conditions or product names are represented as live data.

## Intent-first resolution

The person booking chooses *needs*: cabin baggage, checked baggage, seat selection, nonstop flights, and optionally flexible changes, priority boarding, Fast Track or lounge access. The frontend displays the cheapest valid combination and a second, better-balanced itinerary only when a real improvement is justified by the model. The resolver internally compares these fictional economy bundles:

| Internal bundle | Conceptual contents | Extra value |
| --- | --- | --- |
| **Light** (`basic`) | Small personal item, flight notifications | Cabin baggage, checked baggage and seat selection can be bought separately in the resolver |
| **Comfort** (`classic`) | Personal item, cabin bag, 23 kg checked bag, standard meal, flight notifications | Seat selection can be added if required |
| **Extra** (`flex`) | Comfort services plus seat selection, priority boarding, early check-in and flexible change conditions | The bundled fare may win when individual extras become expensive |

Business or premium cabin variants were reviewed as inspiration but are **out of scope** for this economy POC. The model intentionally makes no real claims about cabin dimensions, refunds, ticket rules or availability.

### How selection works

For every offer, calculate: base itinerary price + internal bundle surcharge + price of missing requested services. If Comfort is unavailable, compare Light + extras with Extra. Choose the least expensive valid candidate; retain all bundled inclusions in the resolved offer model.

In v0.9.4 the resolver also prices missing flexible-change/priority services against what each bundle already includes; Fast Track and lounge access are modelled as independently purchasable extras (24 € / 55 € in mock adult-equivalent prices). A real integration must confirm airport/provider eligibility before offering them.

No commercial fare-choice grid is shown. The current POC ends after flight selection; any real booking flow would disclose every included benefit and contractual condition before payment. The seat selection benefit is **not** a confirmed seat assignment: a real product needs an explicit seat selection step or an equivalent backend flow.

### Mock itinerary ranking (v0.9.2)

Three made-up itinerary patterns can be considered: a connecting option, an early nonstop option, and a daytime nonstop option. When the user requests nonstop-only flights, the connecting option is excluded **before** scoring.

For each itinerary the engine resolves the cheapest internally valid fare + requested services, then computes an illustrative generalized cost:

`cost score = adult-equivalent price + stop/extra-duration penalty + very-early departure penalty`

The lowest **total group price** becomes "Cheapest". A different "Best balance" is displayed only if it improves the score by at least 5 illustrative points. Otherwise the cheapest carries both labels and the results show one row. The engine never invents a second more expensive option just for presentation. The score is a heuristic to demonstrate UX, not evidence that a specific departure time is preferred by a particular user.

The primary visible amount is always the **total reservation price**. A per-person amount is only displayed when there are multiple adults with identical modelled fares and no child/infant pricing. No arithmetic average is shown for mixed-age groups.

### Demo vs production

- Every fare price and rule here is fictitious. The model assumes mock availability for all ancillary categories; this is not a claim that Fast Track or lounge access is offered at any particular airport.
- In real inventory, availability, passenger type, segment-level ancillaries, group rules, checked-bag allowances, payment fees, changes/refunds and carrier-specific restrictions must be verified through provider APIs.
- Do not prefer more expensive fares solely to increase revenue when a lower-priced valid combination provides the user’s requested needs.
- Final applicable contractual conditions and the true total price must be available before any real purchase.
