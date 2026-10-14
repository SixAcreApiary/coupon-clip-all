# Coupon Clip All - Design

## Goal
A personal, unpacked Chrome MV3 extension that clips every Kroger digital coupon on
`https://www.kroger.com/savings/cl/coupons/` from the top down, never clicking
"Boost Member Exclusive" coupons (their button starts an enrollment flow that hijacks the session).

## DOM signals (from a saved page, 2026-10-14)
- Card: `[data-testid="coupon-grid-card"]`, in DOM order (top-down, left-to-right).
- Action button: `[data-testid^="CouponActionButton-"]`, text `Clip` / `Unclip`.
- Boost: savings tag `.SavingsTag--BME` with text `Boost Exclusive`; button text `Enroll in Boost to Clip`.
- Pitfall: the BOOST nutrition-drink brand (`data-brand="BOOST"`) is a normal coupon.
- Page uses infinite scroll (373 coupons, ~307 rendered initially).

## Behavior
- Floating "Clip All" button toggles Start/Stop and shows a running tally.
- Click only when button text is exactly `Clip` and no Boost marker is present; anything else is skipped.
- After click, wait up to 5s for `Unclip`; user-selected delay (0.5-10s, default 1.5s, +/-30% jitter) between clips.
- When no unprocessed cards remain, scroll to bottom; finish after 2 scrolls load nothing.
- Abort if `location.href` changes; stop after 3 consecutive failures (likely clip limit).

## Files
- `manifest.json` - content script on `/savings/cl/coupons*`.
- `src/clipper.js` - `classifyCard` and `run` (DOM/window/sleep injected for testing).
- `src/content.js` - draggable floating panel (delay slider, hide-clipped toggle via a `:has()` CSS rule on `Unclip` aria-labels, Clip All button); delay and position persisted in `chrome.storage.local`.
- `test/` - `node:test` + jsdom against real card fixtures extracted from the saved page.
