# FlightFlow — Visual system (v0.9.5)

This proof of concept uses a small, intentional visual system rather than a large component library.

## Typography

**Plus Jakarta Sans Variable**, bundled by `@fontsource-variable/plus-jakarta-sans` and imported once in `src/main.tsx`. It is **self-hosted by the Vite build**, with no runtime Google Fonts request. System sans-serif fonts remain as fallback.

- Main title: 24–28 px depending on viewport.
- Form field labels and options: 13–14 px.
- Secondary descriptions: 12–14 px.
- Eyebrows and tiny metadata: 11–12 px.
- Prices and numeric counters: tabular figures to reduce layout jumps.

Weights are kept mostly between 400 and 800. Do not rely on synthetic weights beyond the installed variable font range.

## Icons

Use `lucide-react` **named imports**, not runtime string lookups, so unused icons can be tree-shaken.

- Form/navigation controls: 15–18 px; action labels remain visible.
- Offer types: Wallet / Sparkles are decorative; the badges have text.
- Only navigation and offer-state icons are rendered. No service-detail or checkout icon library is needed at this stage.
- Most checkboxes remain native for familiar behavior and keyboard accessibility.
- All purely decorative icon components use `aria-hidden="true"`.

## Motion

`motion/react` is used where it conveys an interaction or change of state, not just decoration.

| Location | Behavior | Duration |
| --- | --- | --- |
| Main views | Fade + small vertical shift | 190 ms |
| Wizard step content | Fade + small shift | 190 ms |
| Expanded dates/needs/minors | Animate height and opacity | 200–210 ms |
| Offer hover/press | Very small lift and press | 140 ms |
| Selected offer continuation | Gentle fade/slide into view | 200 ms |
| About dialog | Fade + subtle scale/shift | 170–200 ms |
| Selection complete | Gentle entrance | 240 ms |

- `MotionConfig reducedMotion="user"` is set at app root.
- Components using translations or mounts guard positional motion with `useReducedMotion()`.
- CSS transitions also respect `prefers-reduced-motion: reduce`.
- **Never** animate fare prices as if they were live data. Prices remain fictional and stable after a mock search.
- Loading delays are already part of the demonstration and should not be lengthened by animations.

## Colors

Retain the restrained petrol-blue and muted green palette from v0.9.4. Do not add new vivid accent colors for decorative motion. Green is reserved for successful/selected states; text carries the meaning without color alone.

## Accessibility / implementation notes

- Interactive rows remain real buttons, keyboard-operable and use `aria-pressed`.
- Step labels and service labels remain text, not icons alone.
- Focus visibility is preserved in the stylesheet.
- Motion and decorative icons do **not** change the core offer resolver or the flight-selection workflow.
- A full screen-reader and cross-browser audit remains out of scope for this prototype.

## Quick search presentation (v0.9.7)

The compact variant keeps the Plus Jakarta Sans and blue-petrol palette. Desktop presents origin, destination, outbound date, optional return, travellers and the search action horizontally, with trip type and needs just above. Below ~1040px it switches to a two-column layout. Dates, travellers and preferences expand locally without leaving the screen. The mode selector remains outside the search card, reinforcing that these are two alternative interfaces over a single model.

## Results and completion refinements (v0.9.8)

- The search-mode selector reads **Paso a paso / Barra de búsqueda** in Spanish and **Step by step / Search bar** in English. It describes two presentation variants, not guaranteed search speeds.
- Result rows prioritize the **chosen flight dates**, then time range, city/airport code when known, stops and duration. Slightly larger inter-group spacing aids scanning; the cards remain compact and fully clickable.
- The final confirmation uses a small inline check icon and a compact selected-itinerary summary. It repeats the **actual mock offer dates and times**, not the original flexible date window. The demo disclaimer is a quiet one-line footnote.
- Reduced-motion behavior and the existing petrol-blue/green palette are unchanged.
